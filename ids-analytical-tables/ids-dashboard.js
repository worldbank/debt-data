(function () {
  'use strict';

  if (!window.IDS || !IDS.tables[document.body.dataset.table]) {
    var failed = document.getElementById('country');
    failed.options[0].text = 'Unavailable';
    var notice = document.getElementById('message');
    notice.className = 'error';
    notice.textContent = 'This page could not load its table files, or this browser could not run them. Try refreshing, or use a current version of your browser.';
    return;
  }

  var TABLE = IDS.tables[document.body.dataset.table];
  var DEFAULT_COUNTRY = 'AFG';
  var TIMEOUT_MS = 20000;
  // API responses are cached for up to 24 hours. Change this after a data release
  // to make browsers and the CDN fetch fresh data straight away. Also change ?v= in
  // both HTML files, or browsers may keep using their old copy of this file for hours.
  var DATA_VERSION = '1';

  var select = document.getElementById('country');
  var statusEl = document.getElementById('status');
  var messageEl = document.getElementById('message');
  var areaEl = document.getElementById('table-area');
  var tableEl = document.getElementById('table');
  var sourceEl = document.getElementById('source');

  var years = [];
  var latestRequest = 0;

  document.getElementById('table-title').textContent = TABLE.title;
  document.getElementById('note').textContent = TABLE.note;

  // The API's data endpoint sends no CORS header, so fetch() is blocked in browsers;
  // JSONP is the route that works. The callback name is fixed per request so that
  // repeat requests share a URL and can be answered from the CDN cache.
  function jsonpOnce(path, params, callbackName) {
    return new Promise(function (resolve, reject) {
      var query = new URLSearchParams(Object.assign({}, params, {
        format: 'jsonp', prefix: callbackName, v: DATA_VERSION,
      }));
      var script = document.createElement('script');
      var timer;
      function finish() {
        clearTimeout(timer);
        script.remove();
        // Left in place so a response arriving after a timeout is ignored quietly.
        window[callbackName] = function () {};
      }
      window[callbackName] = function (response) { finish(); resolve(response); };
      script.onerror = function () { finish(); reject(new Error('The request failed')); };
      timer = setTimeout(function () { finish(); reject(new Error('The request timed out')); }, TIMEOUT_MS);
      script.src = IDS.API_BASE + path + '?' + query;
      document.head.appendChild(script);
    });
  }

  function jsonp(path, params, callbackName) {
    return jsonpOnce(path, params, callbackName).catch(function () {
      return jsonpOnce(path, params, callbackName);
    });
  }

  function loadCountries() {
    return jsonp('/sources/6/country', { per_page: 500 }, 'idsCountries').then(function (response) {
      var all = response.source[0].concept[0].variable
        .sort(function (a, b) { return a.value.localeCompare(b.value); });
      return {
        countries: all.filter(function (c) { return !IDS.AGGREGATES.includes(c.id); }),
        groups: all.filter(function (c) { return IDS.GROUPS.includes(c.id); }),
      };
    });
  }

  // The newest year with data for all low- and middle-income countries sets the
  // window, so the table moves forward by itself when a new release goes live.
  function loadYears() {
    return jsonp(IDS.dataPath('LMY', ['DT.DOD.DECT.CD'], 'all'), { per_page: 200 }, 'idsYears').then(function (response) {
      var totals = IDS.parseResponse(response).series['DT.DOD.DECT.CD'] || {};
      var withData = Object.keys(totals).filter(function (y) { return totals[y] !== null; }).map(Number);
      if (!withData.length) throw new Error('No years with data');
      var last = Math.max.apply(null, withData);
      var list = [];
      for (var y = last - IDS.YEARS_SHOWN + 1; y <= last; y++) list.push(String(y));
      return list;
    });
  }

  function clearMessage() {
    messageEl.className = '';
    messageEl.textContent = '';
  }

  function showError(text, retry) {
    messageEl.className = 'error';
    messageEl.textContent = text;
    if (retry) {
      var button = document.createElement('button');
      button.textContent = 'Try again';
      button.addEventListener('click', retry);
      messageEl.appendChild(button);
    }
  }

  function render(bySeries) {
    var head = document.createElement('thead');
    var headRow = head.insertRow();
    [TABLE.unitNote].concat(years).forEach(function (text) {
      var th = document.createElement('th');
      th.scope = 'col';
      th.textContent = text;
      headRow.appendChild(th);
    });

    var body = document.createElement('tbody');
    TABLE.entries.forEach(function (entry) {
      var tr = body.insertRow();
      var th = document.createElement('th');
      tr.appendChild(th);
      if (entry.heading) {
        tr.className = 'section';
        th.colSpan = years.length + 1;
        th.style.paddingLeft = entry.indent + 'px';
        th.style.fontSize = entry.size + 'px';
        var span = document.createElement('span');
        span.textContent = entry.label;
        th.appendChild(span);
        return;
      }
      th.scope = 'row';
      th.textContent = entry.label;
      th.style.paddingLeft = entry.indent + 'px';
      if (entry.bold) th.style.fontWeight = '700';
      if (entry.italic) th.style.fontStyle = 'italic';
      if (entry.blue) th.className = 'blue';
      if (typeof entry.source === 'string') {
        th.title = entry.source;
      } else {
        th.title = entry.source.map(function (term, i) {
          return (term[0] < 0 ? '− ' : i ? '+ ' : '') + term[1];
        }).join(' ');
      }
      years.forEach(function (year) {
        tr.insertCell().textContent = IDS.cellText(entry, bySeries, year);
      });
    });

    tableEl.style.fontSize = TABLE.fontSize + 'px';
    tableEl.replaceChildren(head, body);
    tableEl.hidden = false;
  }

  function show() {
    var requestId = ++latestRequest;
    var code = select.value;
    var name = select.options[select.selectedIndex].text;
    var codes = IDS.seriesOf(TABLE);
    clearMessage();
    areaEl.classList.add('loading');
    statusEl.textContent = 'Loading ' + name + '…';

    return Promise.resolve().then(function () {
      return jsonp(IDS.tablePath(TABLE, code, years), { per_page: IDS.PER_PAGE }, 'idsData_' + TABLE.id + '_' + code);
    }).then(function (response) {
      if (requestId !== latestRequest) return;
      var parsed = IDS.parseResponse(response);
      if (parsed.pages !== 1) throw new Error('Response was split across pages');
      render(parsed.series);
      areaEl.classList.remove('loading');
      statusEl.textContent = '';
      sourceEl.textContent = 'Source: World Bank International Debt Statistics API. Data last updated ' + parsed.lastUpdated + '.';
      // The API drops unknown codes without an error, so a renamed series would
      // otherwise just look like missing data.
      var missing = codes.filter(function (c) { return !parsed.series[c]; });
      if (missing.length) {
        messageEl.className = 'warning';
        messageEl.textContent = 'The API did not return these series, so their rows may be wrong or empty: ' + missing.join(', ');
      }
    }).catch(function () {
      if (requestId !== latestRequest) return;
      // Hide the table so the previous country's numbers can't be read as this one's.
      tableEl.hidden = true;
      areaEl.classList.remove('loading');
      statusEl.textContent = '';
      showError('Could not load data for ' + name + ' from the World Bank API.', show);
    });
  }

  function selectFromUrl() {
    var wanted = (new URLSearchParams(location.search).get('country') || '').toUpperCase();
    var known = Array.from(select.options).some(function (o) { return o.value === wanted; });
    select.value = known ? wanted : DEFAULT_COUNTRY;
  }


  function optionGroup(label, items) {
    var group = document.createElement('optgroup');
    group.label = label;
    items.forEach(function (c) { group.appendChild(new Option(c.value, c.id)); });
    return group;
  }

  function start() {
    clearMessage();
    select.options[0].text = 'Loading…';
    statusEl.textContent = 'Connecting to the World Bank API…';
    // Starting inside a promise sends any error to the catch below, so it can't leave the page stuck.
    Promise.resolve().then(function () {
      return Promise.all([loadCountries(), loadYears()]);
    }).then(function (results) {
      years = results[1];
      select.replaceChildren(
        optionGroup('Countries', results[0].countries),
        optionGroup('Regions and income groups', results[0].groups)
      );
      select.disabled = false;
      selectFromUrl();
      show();
    }).catch(function (err) {
      statusEl.textContent = '';
      select.options[0].text = 'Unavailable';
      showError('Could not get data from api.worldbank.org (' + err.message + '). The API may be down, or a browser extension, firewall or VPN may be blocking it.', start);
    });
  }

  select.addEventListener('change', function () {
    history.pushState(null, '', '?country=' + select.value);
    show();
  });
  window.addEventListener('popstate', function () { selectFromUrl(); show(); });

  start();
})();
