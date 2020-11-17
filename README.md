# Debt Statistics
This repository contains code related to the World Bank's Debt Statistics.

## Background
Debt Statistics are compiled by World Bank to provide reliable and timely external debt information, which helps assess a borrowing country's foreign debt situation, creditworthiness, and economic management. The statistics also help the Bank conduct its country economic work and assess regional and global indebtedness and debt servicing problems. The data is also widely used for other analytical and operational purposes. Recurrent debt crises, including the global financial crisis of 2008, highlight the importance of measuring and monitoring external debt stocks and flows, and managing them sustainably.


Every year, the World Bank releases the [International Debt Statistics (IDS)](https://data.worldbank.org/products/ids) publication which presents statistics and analysis on the external debt and financial flows for low- and middle-income economies. Every quarter, the World Bank supplements this publication with additional information on the public sector and high-income countries. You can find more information about the World Bank's Debt Statistics on the [Debt Portal](http://datatopics.worldbank.org/debt/).

## Contents
### 1. [api-guide: Accessing International Debt Statistics through World Bank API](https://worldbank.github.io/debt-data/api-guide/)

To encourage the exploration and analysis of the World Bank's IDS data, these step-by-step guides will explain how to use the World Bank Data API to access debt data and then do some exploratory analysis. This will be a two part series. The first guide will show how to query the API for your indicator and location of choice. The second guide will show how to call that information and create a basic chart. The guides are available in Python and R.

### 2. [creditor-composition: Exploring Debt Data by Creditor Composition](https://worldbank.github.io/debt-data/creditor-composition/)

IDS 2021 added an additional dimension to the data – the creditor country. To help you start exploring this data, we put together another step-by-step guide in both Python and R. In the previous guides, we used packages to wrap the API and present us with data. This time, in order to better understand API requests we will take a closer look at how each variable is presented in the URL.

