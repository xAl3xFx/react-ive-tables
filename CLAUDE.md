# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`react-ive-tables` is a published npm library of data-grid components built on top of PrimeReact (`DataTable`, `TreeTable`, `DataView`). `react`, `primereact`, `react-intl`, `axios` and `moment` are **peer dependencies**; don't move them into `dependencies`.

## Commands

Built with [tsdx](https://tsdx.io) (yarn is the lockfile in use):

- `yarn build`: build to `dist/` (CJS + ESM + `.d.ts`). `tsdx.config.js` adds `rollup-plugin-postcss` so the `.css` imports in `src/` get bundled.
- `yarn start`: watch build.
- `yarn lint`: `tsdx lint`. It also runs as a husky pre-commit hook.
- `yarn test`: `tsdx test --passWithNoTests` (Jest). There are currently no tests. Run a single file with `yarn test path/to/file.test.tsx`.
- `yarn size`: size-limit check on the built bundles.

Example/playground app (Parcel, React 19) in `example-react-ive-tables/`:

```bash
cd example-react-ive-tables && yarn start   # parcel public/index.html
```

Pick which demo renders by editing the `selectedTable` state in `example-react-ive-tables/index.tsx`. The older `example/` directory only holds build output.

## Architecture

Public API lives in `src/index.ts`: `ReactiveTable`, `SimpleDataTable`, `SimpleTreeTable`, `MobileFilters`, `MobileDataView`, and the types `FetchDataParams`, `ExportConfig`, `HeaderButton`.

- **`ReactiveTable.tsx`** (the main, actively developed component, about 1000 lines). It is generic over `T` (row type) and `K` (extra column keys such as special or virtual columns). Every prop is documented inline in its `Props` interface, so read that first. Key mechanics:
  - **Columns** come from `columnOrder`. Only the columns listed there are rendered. Headers are translated through `react-intl` `formatMessage` using the column name, or `specialLabels[col]` as the message id. Consumers must wrap the table in an `IntlProvider`.
  - **Data modes.** Client-side: pass `data` and leave out `fetchData`. Lazy: pass `fetchData`, which turns on PrimeReact `lazy` and calls `fetchData({offset, limit, filters, sort, page})` on page, sort and filter changes. With `swr={false}`, `fetchData` must resolve to `{rows, totalRecords}`. With `swr={true}`, it only triggers a refetch, and new rows arrive through the `data` and `totalRecords` props.
  - **Imperative triggers.** Numeric "counter" props (`refresher`, `resetFilters`, `selectionResetter`, `rebuildColumns`) cause an action when their value changes. Follow this pattern when adding similar features.
  - **Customization maps** keyed by column name: `columnTemplate`, `specialFilters`, `specialEditors`, `specialColumns`, `columnStyle`, `columnHeaderTemplate`, `externalFilters`, `filtersMatchMode`. Anything not covered can be passed straight to PrimeReact through `dtProps`.
  - **Excel export** is delegated to the consumer: `exportConfig.onExportExcel` receives the filters, sort, columns and translated labels.
  - **Mobile.** When `isMobile` and `mobileDataTemplate` are set, it renders `mobile/MobileDataView` (a PrimeReact DataView) plus a `MobileFilters` dialog instead of the DataTable.
- **`SimpleDataTable.tsx`** is an older, non-lazy variant with its own copies of the `StringKeys`, `SpecialFilter` and `FiltersMatchMode` types. Changes to shared behavior may need to be made in both files.
- **`SimpleTreeTable.tsx`** is a thin wrapper around PrimeReact's TreeTable.

## Branches & releases

`master` is the main branch. `v1` and `v2` are release lines, and `v2` (React 19 / PrimeReact 10, versions `2.0.0-x`) is current. Fixes on `v1` get merged forward into `v2`. Releases are commits titled with the version number (e.g. `v2.0.0-4`) that bump `package.json`.

The README is outdated: it mentions `LazyDataTableOld` and React 17.
