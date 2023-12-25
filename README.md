# DataView
This is my Js Library for Render View from an Array Object Starting in June Mid


# DataView.js Documentation

DataView.js is a JavaScript library that facilitates dynamic rendering of HTML templates based on a provided array of objects. It supports various view types, lazy loading of images, and flexible templating options.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
  - [Initialization](#initialization)
  - [Configuration](#configuration)
  - [Templates](#templates)
  - [Rendering](#rendering)
- [Configuration Options](#configuration-options)
  - [General Configuration](#general-configuration)
  - [Templating Engine](#templating-engine)
  - [API Placeholders](#api-placeholders)
  - [Additional Configuration](#additional-configuration)
- [Examples](#examples)
- [Advanced Features](#advanced-features)
  - [Lazy Loading](#lazy-loading)
  - [Autoload and AutoFetch](#autoload-and-autofetch)
- [Templating Engine Details](#templating-engine-details)
- [API Placeholders Details](#api-placeholders-details)
- [Contributing](#contributing)
- [License](#license)

## Installation

Explain how users can install your library.

```bash
npm install dataview

```

# Basic Example

```javascript
// Sample data
let data = [
  { /* ... */ },
  // Additional data objects
];

// Initialize DataView
const dataView = new DataView(data, viewContainer);

// Configure DataView settings
dataView.config({
  perPage: 20,
  gridGap: "20px",
  // Add other configuration options
});

// Set templates for grid, list, and table views
dataView.gridItemTemplate = `<div class="card">{/* ... */}</div>`;
dataView.listItemTemplate = `<div class="card">{/* ... */}</div>`;
dataView.tableRowHtml = `<tr>{/* ... */}</tr>`;

// Render the DataView
dataView.view = "grid";

```
# Configuration Options

Pagination:

perPage: Number of items per page. Default is 20.
Grid View Configuration:

gridGap: Gap between grid items. Default is '10px'.
gridItemMinWidth: Minimum width of grid items. Default is '200px'.
gridItemWidth: Width of grid items. Default is 'fit'.
List View Configuration:

listGap: Gap between list items. Default is '10px'.
listItemMinWidth: Minimum width of list items. Default is '500px'.
listItemWidth: Width of list items. Default is 'fit'.
Positioning:

position: Position of the view (grid/list/table) within the container. Default is dataView.POSITIONS.LEFT.
Animation:

animation: Animation effect for transitioning between views. Default is false.
animationDuration: Duration of the animation. Default is '1.4s' or a CSS variable.
Search Configuration:

searchIn: Column to search in. Default is 'all'.
searchCaseSensitive: Whether the search is case-sensitive. Default is false.
apiSearching: Enable searching through an API. Default is false.
searchApi: API endpoint for searching. Default is an empty string.
Auto-loading Configuration:

autoload: Whether to load more data automatically. Default is true.
autoloadWhen: Number of items remaining before triggering autoload. Default is 5.
Auto-fetch Configuration:

autoFetch: Whether to fetch more data after rendering. Default is false.
autoFetchWhen: Number of items remaining before triggering auto-fetch. Default is 40.
dataApiUrl: API endpoint for fetching additional data. Default is an empty string.
Lazy Loading Image:

lazyloadImageColor: Background color for lazy-loaded images. Default is 'linear-gradient(45deg, white 0%, black 59%)'.

# API Placeholders

For dataApiUrl:

{last:index} or {last}: Represents the last index fetched, allowing you to fetch data starting from the last index. For example, if the last index is 40, it will fetch data starting from index 39.

{last:counter}: Represents the last counter/row/length fetched, enabling you to fetch data starting from the last counter. For instance, if the last counter is 40, it will fetch data starting from counter 40.

{last:column}: Represents the last index column, letting you fetch data starting from the last index column.

{perPage}: Represents the number of items per page, helping in paginating the API request. It allows dynamic control over the number of items fetched.

For searchApi:

{query}: Represents the search query for simple searches.

{searchCaseSensitive}: Represents whether the search is case-sensitive. It returns true or false.

{column}: Represents the column on which the search is performed. It returns the value set in the searchIn configuration.

# Templating Engine

One-time Parse Placeholders ({{}}):
{{date:d}}: Prints the current day of the month (e.g., 30).
{{date:m}}: Prints the current month (e.g., 6).
{{date:y}}: Prints the current year (e.g., 2023).
{{time:h}}: Prints the current hour (e.g., 3).
{{time:m}}: Prints the current minute (e.g., 43).
{{time:s}}: Prints the current second (e.g., 30).
{{loadimage|height|width?optional|img_tag}}: Lazy loads an image with specified height and width, optionally including an img tag.
Parse for Every Row Placeholders ({%%}):
{%column:column_name%}: Prints the value of the specified column.
{%column:column_name[key]%}: Prints the value of a key within a column if the column is an array or object.
{%column:column_name|allCap%}: Capitalizes all letters in the column value.
{%column:column_name|allSmall%}: Converts all letters in the column value to lowercase.
{%column:column_name|firstCap%}: Capitalizes the first letter of the column value.
{%column:title|length:20%}: Limits the length of the column value to 20 characters.
{%column:column_name|formatNum%}: Formats the column value as a number with commas (e.g., 100000 becomes 100,000).
Lazy Load Image Examples:
{{loadimage|40px|40px|<img src="https://source.unsplash.com/random/300x250/?{%counter%}" className="card-img-top" alt="..." loading="lazy">}}: Lazy loads an image with a specified height and width (40px x 40px) using an img tag.
{{loadimage|40px|<img src="https://source.unsplash.com/random/300x250/?{%counter%}" className="card-img-top" alt="..." loading="lazy">}}: Lazy loads an image with a specified height (40px) and uses an img tag.