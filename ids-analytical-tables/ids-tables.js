/*
 * Table definitions and number formatting for the IDS dashboard.
 * No browser dependencies, so tools/verify.mjs tests the same logic the page uses.
 *
 * To add the standard table, add another entry to IDS.tables.
 *
 * A row's source is either:
 *   'SERIES.CODE'                 shown directly; a missing value shows as ".."
 *   [[+1, 'CODE'], [-1, 'CODE']]  calculated; missing values count as 0
 */
(function (root) {
  'use strict';

  // id: row id on the published page. indent: px. style: b = bold, i = italic.
  function row(id, label, indent, style, source) {
    return { id: id, label: label, indent: indent, bold: style.includes('b'), italic: style.includes('i'), source: source };
  }
  function heading(label, level) {
    return { heading: true, label: label, level: level };
  }
  function plus() {
    return Array.from(arguments).map(function (code) { return [1, code]; });
  }

  // One debt flow block (disbursements, principal, interest) by debtor type.
  function debtorFlow(prefix, label, ids) {
    return [
      row(ids[0], label, 10, 'b', prefix + '.DLXF.CD'),
      row(ids[1], 'Public and publicly guaranteed sector', 20, 'i', prefix + '.DPPG.CD'),
      row(ids[2], 'Public sector', 30, '', prefix + '.DEPS.CD'),
      row(ids[3], 'of which: General Government', 40, '', prefix + '.DEGG.CD'),
      row(ids[4], 'Private sector guaranteed by public sector', 30, '', prefix + '.PRPG.CD'),
      row(ids[5], 'Private sector not guaranteed', 20, 'i', prefix + '.DPNG.CD'),
    ];
  }

  var analytical = {
    id: 'analytical',
    title: 'Country analytical table',
    unitNote: '$ millions, unless otherwise indicated',
    note: 'Note: Public and publicly guaranteed does not include the Use of IMF credit and SDR allocations.',
    entries: [].concat(
      [
        heading('Summary external debt data by debtor type', 1),
        row('R1', 'Total External debt stocks', 10, 'b', 'DT.DOD.DECT.CD'),
        row('R2', 'Use of IMF Credit and SDR allocations', 20, 'bi', 'DT.DOD.DIMF.CD'),
        row('R3', 'Long-term external debt', 20, 'bi', 'DT.DOD.DLXF.CD'),
        row('R4', 'Public and publicly guaranteed sector', 30, 'i', 'DT.DOD.DPPG.CD'),
        row('R64', 'Public sector', 40, '', 'DT.DOD.DEPS.CD'),
        row('R65', 'of which: General Government', 50, '', 'DT.DOD.DEGG.CD'),
        row('R66', 'Private sector guaranteed by public sector', 40, '', 'DT.DOD.PRPG.CD'),
        row('R5', 'Private sector not guaranteed', 30, 'i', 'DT.DOD.DPNG.CD'),
        row('R6', 'Short-term external debt', 20, 'bi', 'DT.DOD.DSTC.CD'),
      ],
      debtorFlow('DT.DIS', 'Disbursements (long-term)', ['R7', 'R8', 'R67', 'R68', 'R69', 'R9']),
      debtorFlow('DT.AMT', 'Principal repayments (long-term)', ['R10', 'R11', 'R70', 'R71', 'R72', 'R12']),
      debtorFlow('DT.INT', 'Interest payments (long-term)', ['R13', 'R14', 'R73', 'R74', 'R75', 'R15']),
      [
        heading('Summary external debt stock by creditor type', 1),
        row('R54', 'Long-term External debt stocks', 10, 'b', 'DT.DOD.DLXF.CD'),
        row('R55', 'Public and publicly guaranteed debt from:', 20, 'i', 'DT.DOD.DPPG.CD'),
        row('R16', 'Official creditors', 30, '', 'DT.DOD.OFFT.CD'),
        row('R17', 'Multilateral', 40, '', 'DT.DOD.MLAT.CD'),
        row('R52', 'of which: World Bank', 50, '', plus('DT.DOD.MIBR.CD', 'DT.DOD.MIDA.CD')),
        row('R20', 'Bilateral', 40, '', 'DT.DOD.BLAT.CD'),
        row('R21', 'Private creditors', 30, '', 'DT.DOD.PRVT.CD'),
        row('R22', 'Bondholders', 40, '', 'DT.DOD.PBND.CD'),
        row('R53', 'Commercial banks and others', 40, '', plus('DT.DOD.PCBK.CD', 'DT.DOD.PROP.CD')),
        row('R56', 'Private nonguaranteed debt from:', 20, 'i', 'DT.DOD.DPNG.CD'),
        row('R25', 'Bondholders', 40, '', 'DT.DOD.PNGB.CD'),
        row('R26', 'Commercial banks and others', 40, '', 'DT.DOD.PNGC.CD'),
        row('R57', 'Use of IMF Credit and SDR allocations', 10, 'b', 'DT.DOD.DIMF.CD'),

        heading('Net financial inflows', 1),
        heading('Net debt inflows', 2),
        row('R59', 'Use of IMF Credit', 20, 'i', [[1, 'DT.DIS.DIMF.CD'], [-1, 'DT.AMT.DIMF.CD']]),
        row('R29', 'Long-term', 20, 'i', 'DT.NFL.DLXF.CD'),
        row('R30', 'Official creditors', 30, '', 'DT.NFL.OFFT.CD'),
        row('R31', 'Multilateral', 40, '', 'DT.NFL.MLAT.CD'),
        row('R60', 'of which: World Bank', 50, '', plus('DT.NFL.MIBR.CD', 'DT.NFL.MIDA.CD')),
        row('R34', 'Bilateral', 40, '', 'DT.NFL.BLAT.CD'),
        row('R61', 'Private creditors', 30, '', plus('DT.NFL.PRVT.CD', 'DT.NFL.DPNG.CD')),
        row('R62', 'Bondholders', 40, '', plus('DT.NFL.PBND.CD', 'DT.NFL.PNGB.CD')),
        row('R63', 'Banks and other private', 40, '', [
          [1, 'DT.NFL.PRVT.CD'], [1, 'DT.NFL.DPNG.CD'], [-1, 'DT.NFL.PBND.CD'], [-1, 'DT.NFL.PNGB.CD'],
        ]),
        row('R42', 'Short-term', 20, 'i', 'DT.NFL.DSTC.CD'),
        heading('Net equity inflows', 2),
        row('R43', 'Foreign direct investment', 20, '', 'BX.KLT.DINV.CD.DT'),
        row('R44', 'Portfolio equity', 20, '', 'BX.PEF.TOTL.CD.DT'),

        heading('Debt ratios', 1),
        row('R45', 'External debt stocks to exports (%)', 10, '', 'DT.DOD.DECT.EX.ZS'),
        row('R46', 'External debt stocks to GNI (%)', 10, '', 'DT.DOD.DECT.GN.ZS'),
        row('R47', 'Debt service to exports (%)', 10, '', 'DT.TDS.DECT.EX.ZS'),
        row('R48', 'Short-term to external debt stocks (%)', 10, '', 'DT.DOD.DSTC.ZS'),
        row('R49', 'Multilateral to external debt stocks (%)', 10, '', 'DT.DOD.MLAT.ZS'),
        row('R50', 'Reserves to external debt stocks (%)', 10, '', 'FI.RES.TOTL.DT.ZS'),
        row('R51', 'Gross national income (GNI)', 10, '', 'NY.GNP.MKTP.CD'),
      ]
    ),
  };

  // Regional and income groups the API lists as countries.
  var AGGREGATES = ['EAP', 'ECA', 'IDA', 'IDX', 'LAC', 'LDC', 'LIC', 'LMC', 'LMY', 'MIC', 'MNA', 'SAS', 'SSA', 'UMC'];

  function rowsOf(table) {
    return table.entries.filter(function (entry) { return !entry.heading; });
  }

  function seriesOf(table) {
    var codes = new Set();
    rowsOf(table).forEach(function (r) {
      if (typeof r.source === 'string') codes.add(r.source);
      else r.source.forEach(function (term) { codes.add(term[1]); });
    });
    return Array.from(codes);
  }

  // Half-up, away from zero, on the number's shortest decimal form. toFixed works on
  // the binary value instead, and would turn a published 4.05 into 4.0.
  function formatOneDecimal(value) {
    var text = String(Math.abs(value));
    if (text.includes('e')) text = Math.abs(value).toFixed(20);
    var parts = text.split('.');
    var tenths = Number(parts[0] + (parts[1] || '0').charAt(0));
    if ((parts[1] || '').charAt(1) >= '5') tenths += 1;
    var digits = String(tenths).padStart(2, '0');
    var whole = digits.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // A value that rounds to zero prints as 0.0, never -0.0.
    var sign = value < 0 && tenths !== 0 ? '-' : '';
    return sign + whole + '.' + digits.slice(-1);
  }

  function cellValue(r, bySeries, year) {
    var raw;
    if (typeof r.source === 'string') {
      raw = (bySeries[r.source] || {})[year];
      if (raw === null || raw === undefined) return null;
      return r.source.endsWith('.ZS') ? raw : raw / 1e6;
    }
    raw = r.source.reduce(function (total, term) {
      return total + term[0] * ((bySeries[term[1]] || {})[year] || 0);
    }, 0);
    return raw / 1e6;
  }

  function cellText(r, bySeries, year) {
    var value = cellValue(r, bySeries, year);
    return value === null ? '..' : formatOneDecimal(value);
  }

  // API response -> { series: { code: { year: value } }, lastUpdated, pages }
  function parseResponse(response) {
    var source = response && response.source;
    if (!source || !Array.isArray(source.data)) throw new Error('Unexpected API response');
    var series = {};
    source.data.forEach(function (item) {
      var dims = {};
      item.variable.forEach(function (v) { dims[v.concept] = v.id; });
      (series[dims.Series] = series[dims.Series] || {})[dims.Time.replace('YR', '')] = item.value;
    });
    return { series: series, lastUpdated: response.lastupdated, pages: response.pages };
  }

  function dataPath(country, codes, years) {
    return '/sources/6/country/' + country + '/series/' + codes.join(';') +
      '/counterpart-area/WLD/time/' + years.map(function (y) { return 'YR' + y; }).join(';');
  }

  root.IDS = {
    API_BASE: 'https://api.worldbank.org/v2',
    AGGREGATES: AGGREGATES,
    YEARS_SHOWN: 11,
    tables: { analytical: analytical },
    rowsOf: rowsOf,
    seriesOf: seriesOf,
    formatOneDecimal: formatOneDecimal,
    cellText: cellText,
    parseResponse: parseResponse,
    dataPath: dataPath,
  };
})(globalThis);
