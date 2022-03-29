## v5.0.0 (2022-03-29)

Ember Octane, v4 and Embroider support. Includes all changes since 4.0.3.

Requires Ember 3.25 or above.
Requires ember-auto-import 2.0 or above.

[Upgrade guide](https://ember-file-upload.pages.dev/docs/upgrade-guide#upgrading-to-v5)

#### :memo: Documentation
* [#754](https://github.com/adopted-ember-addons/ember-file-upload/pull/754) Correct typos in FileDropzone API docs ([@AddisonG](https://github.com/AddisonG))

#### Committers: 1
- Addison G ([@AddisonG](https://github.com/AddisonG))

## v5.0.0-beta.10 (2022-03-29)

#### :rocket: Enhancement
* [#706](https://github.com/adopted-ember-addons/ember-file-upload/pull/706) Deprecate `FileUpload` component and `FileDropzone` attribute args ([@gilest](https://github.com/gilest))

#### :memo: Documentation
* [#752](https://github.com/adopted-ember-addons/ember-file-upload/pull/752) Add GitHub link and default page title to docs site ([@gilest](https://github.com/gilest))
* [#748](https://github.com/adopted-ember-addons/ember-file-upload/pull/748) Point docs links to newly deployed website ([@gilest](https://github.com/gilest))
* [#740](https://github.com/adopted-ember-addons/ember-file-upload/pull/740) Add API Reference section to docs site ([@gilest](https://github.com/gilest))
* [#734](https://github.com/adopted-ember-addons/ember-file-upload/pull/734) Generate new Docfy documentation website ([@gilest](https://github.com/gilest))

#### :house: Internal
* [#749](https://github.com/adopted-ember-addons/ember-file-upload/pull/749) Migrate tests into `test-app` package ([@gilest](https://github.com/gilest))
* [#747](https://github.com/adopted-ember-addons/ember-file-upload/pull/747) Update test matrix ([@gilest](https://github.com/gilest))
* [#746](https://github.com/adopted-ember-addons/ember-file-upload/pull/746) Run docs website CI in GitHub Actions ([@gilest](https://github.com/gilest))

#### Committers: 1
- Giles Thompson ([@gilest](https://github.com/gilest))

## v5.0.0-beta.9 (2022-03-18)

#### :rocket: Enhancement
* [#731](https://github.com/adopted-ember-addons/ember-file-upload/pull/731) Add `files` and `index` to `filter` callback ([@mkszepp](https://github.com/mkszepp))

#### :memo: Documentation
* [#723](https://github.com/adopted-ember-addons/ember-file-upload/pull/723) Add Upgrading to v5 guide ([@gilest](https://github.com/gilest))
* [#721](https://github.com/adopted-ember-addons/ember-file-upload/pull/721) Rewrite `docs/` markdown files with v5 API and add a support matrix to README ([@gilest](https://github.com/gilest))

#### :house: Internal
* [#722](https://github.com/adopted-ember-addons/ember-file-upload/pull/722) Automate dependency upgrades within SemVer range ([@jelhan](https://github.com/jelhan))

#### Committers: 3
- Giles Thompson ([@gilest](https://github.com/gilest))
- Jeldrik Hanschke ([@jelhan](https://github.com/jelhan))
- [@mkszepp](https://github.com/mkszepp)

## v5.0.0-beta.8 (2022-03-04)

#### :boom: Breaking Change
* [#705](https://github.com/adopted-ember-addons/ember-file-upload/pull/705) Prefix all callbacks with `on` ([@gilest](https://github.com/gilest))

#### :rocket: Enhancement
* [#678](https://github.com/adopted-ember-addons/ember-file-upload/pull/678) Update FileDropzone API ([@gilest](https://github.com/gilest))

#### :bug: Bug Fix
* [#711](https://github.com/adopted-ember-addons/ember-file-upload/pull/711) Remove whitespace when rendering FileUpload ([@nwhittaker](https://github.com/nwhittaker))

#### :house: Internal
* [#710](https://github.com/adopted-ember-addons/ember-file-upload/pull/710) Restore project-wide doc files to repository root ([@nwhittaker](https://github.com/nwhittaker))
* [#675](https://github.com/adopted-ember-addons/ember-file-upload/pull/675) Move into a monorepo ([@gossi](https://github.com/gossi))

#### Committers: 3
- Giles Thompson ([@gilest](https://github.com/gilest))
- Nathan Whittaker ([@nwhittaker](https://github.com/nwhittaker))
- Thomas Gossmann ([@gossi](https://github.com/gossi))

## v5.0.0-beta.7 (2022-02-19)

#### :bug: Bug Fix
* [#700](https://github.com/adopted-ember-addons/ember-file-upload/pull/700) FileUpload: Defer onFileAdd callback ([@gilest](https://github.com/gilest))

#### :house: Internal
* [#685](https://github.com/adopted-ember-addons/ember-file-upload/pull/685) Renovate: Ignore Ember type definitions ([@gilest](https://github.com/gilest))

#### Committers: 1
- Giles Thompson ([@gilest](https://github.com/gilest))

## v5.0.0-beta.6 (2022-02-07)

#### :bug: Bug Fix
* [#684](https://github.com/adopted-ember-addons/ember-file-upload/pull/684) Exclude miragejs from ember-auto-import ([@gilest](https://github.com/gilest))

#### Committers: 1
- Giles Thompson ([@gilest](https://github.com/gilest))

## v5.0.0-beta.5 (2022-02-02)

#### :bug: Bug Fix
* [#682](https://github.com/adopted-ember-addons/ember-file-upload/pull/682) `UploadFile.size` always returns 0 ([@jrjohnson](https://github.com/jrjohnson))

#### :house: Internal
* [#664](https://github.com/adopted-ember-addons/ember-file-upload/pull/664) Clear mirage deprecations ([@jrjohnson](https://github.com/jrjohnson))

#### Committers: 1
- Jon Johnson ([@jrjohnson](https://github.com/jrjohnson))

## v5.0.0-beta.4 (2022-02-01)

#### :bug: Bug Fix
* [#681](https://github.com/adopted-ember-addons/ember-file-upload/pull/681) UploadFile: Restore `name` setter ([@gilest](https://github.com/gilest))
* [#654](https://github.com/adopted-ember-addons/ember-file-upload/pull/654) Bind FileUpload component to the queue with a modifier. Drop `@ember/render-modifiers` ([@gilest](https://github.com/gilest))

#### Committers: 1
- Giles Thompson ([@gilest](https://github.com/gilest))

## v5.0.0-beta.3 (2022-01-26)

#### :bug: Bug Fix
* [#676](https://github.com/adopted-ember-addons/ember-file-upload/pull/676) Avoid mutating upload options ([@bertdeblock](https://github.com/bertdeblock))

#### :house: Internal
* [#660](https://github.com/adopted-ember-addons/ember-file-upload/pull/660) Add type definitions from `@ember/destroyable` ([@gilest](https://github.com/gilest))
* [#655](https://github.com/adopted-ember-addons/ember-file-upload/pull/655) Use guidFor in place of uuid ([@gilest](https://github.com/gilest))

#### Committers: 2
- Bert De Block ([@bertdeblock](https://github.com/bertdeblock))
- Giles Thompson ([@gilest](https://github.com/gilest))

## v5.0.0-beta.2 (2022-01-19)

#### :boom: Breaking Change
* [#620](https://github.com/adopted-ember-addons/ember-file-upload/pull/620) Add events to file-queue helper set up TypeScript, drop ember-cli-addon-docs, drop support for Ember < 3.28 ([@gossi](https://github.com/gossi))
* [#583](https://github.com/adopted-ember-addons/ember-file-upload/pull/583) Drop deprecated lowercase events ([@gilest](https://github.com/gilest))

#### :rocket: Enhancement
* [#620](https://github.com/adopted-ember-addons/ember-file-upload/pull/620) Add events to file-queue helper set up TypeScript, drop ember-cli-addon-docs, drop support for Ember < 3.28 ([@gossi](https://github.com/gossi))

#### :house: Internal
* [#645](https://github.com/adopted-ember-addons/ember-file-upload/pull/645) Drop docs deployment and required dependencies ([@gilest](https://github.com/gilest))
* [#640](https://github.com/adopted-ember-addons/ember-file-upload/pull/640) Updated test filesize since Chrome 97 reports it differently ([@gilest](https://github.com/gilest))

#### Committers: 2
- Giles Thompson ([@gilest](https://github.com/gilest))
- Thomas Gossmann ([@gossi](https://github.com/gossi))

## v5.0.0-beta.1 (2021-10-28)

#### :boom: Breaking Change
* [#583](https://github.com/adopted-ember-addons/ember-file-upload/pull/583) Drop deprecated lowercase events ([@gilest](https://github.com/gilest))

#### Committers: 1
- Giles Thompson ([@gilest](https://github.com/gilest))

## v5.0.0-beta.0 (2021-10-26)

#### :boom: Breaking Change
* [#514](https://github.com/adopted-ember-addons/ember-file-upload/pull/514) Upgrade to glimmer components and native classes ([@gilest](https://github.com/gilest))
* [#578](https://github.com/adopted-ember-addons/ember-file-upload/pull/578) Drop internal validation and add user validation component callbacks ([@gilest](https://github.com/gilest))

#### :rocket: Enhancement
* [#567](https://github.com/adopted-ember-addons/ember-file-upload/pull/567) Conditionally exclude mirage handler from builds ([@gilest](https://github.com/gilest))

#### :memo: Documentation
* [#543](https://github.com/adopted-ember-addons/ember-file-upload/pull/543) Fix DemoUpload component ([@gilest](https://github.com/gilest))
* [#522](https://github.com/adopted-ember-addons/ember-file-upload/pull/522) Update docs examples to use Octane syntax ([@gilest](https://github.com/gilest))

#### :house: Internal
* [#542](https://github.com/adopted-ember-addons/ember-file-upload/pull/542) Bump ember-cli and run ember-cli-update ([@gilest](https://github.com/gilest))

#### Committers: 1
- Giles Thompson ([@gilest](https://github.com/gilest))

## v4.0.3 (2021-09-24)

## v4.0.2 (2021-09-03)

#### :memo: Documentation
* [#519](https://github.com/adopted-ember-addons/ember-file-upload/pull/519) Update docsite homepage after background color change ([@gilest](https://github.com/gilest))

#### Committers: 1
- Giles Thompson ([@gilest](https://github.com/gilest))

## v4.0.1 (2021-08-22)

#### :memo: Documentation
* [#292](https://github.com/adopted-ember-addons/ember-file-upload/pull/292) Update component docs to use angle bracket syntax ([@mcfiredrill](https://github.com/mcfiredrill))

#### :house: Internal
* [#502](https://github.com/adopted-ember-addons/ember-file-upload/pull/502) chore(ci): uploaded file size reported by Chrome has changed ([@gilest](https://github.com/gilest))
* [#481](https://github.com/adopted-ember-addons/ember-file-upload/pull/481) Add concurrency to deploy workflow ([@gilest](https://github.com/gilest))

#### Committers: 2
- Giles Thompson ([@gilest](https://github.com/gilest))
- Tony Miller ([@mcfiredrill](https://github.com/mcfiredrill))

## v4.0.0 (2021-06-21)

#### :boom: Breaking Change
* [#464](https://github.com/adopted-ember-addons/ember-file-upload/pull/464) Drop support for Node 10 ([@gilest](https://github.com/gilest))
* [#430](https://github.com/adopted-ember-addons/ember-file-upload/pull/430) Drop support for Ember < 3.16 (and upgrade to Ember 3.26) ([@bendemboski](https://github.com/bendemboski))

#### :rocket: Enhancement
* [#476](https://github.com/adopted-ember-addons/ember-file-upload/pull/476) Renamed all events to camelCase ([@gilest](https://github.com/gilest))

#### :bug: Bug Fix
* [#475](https://github.com/adopted-ember-addons/ember-file-upload/pull/475) Ignore progress events where the total file size is reported as 0 bytes ([@gilest](https://github.com/gilest))

#### :memo: Documentation
* [#479](https://github.com/adopted-ember-addons/ember-file-upload/pull/479) Improve copy and layout of doc site index ([@gilest](https://github.com/gilest))
* [#478](https://github.com/adopted-ember-addons/ember-file-upload/pull/478) Replace Travis CI badge with GitHub Actions ([@gilest](https://github.com/gilest))

#### :house: Internal
* [#429](https://github.com/adopted-ember-addons/ember-file-upload/pull/429) Migrate CI to GitHub Actions ([@gilest](https://github.com/gilest))

#### Committers: 2
- Ben Demboski ([@bendemboski](https://github.com/bendemboski))
- Giles Thompson ([@gilest](https://github.com/gilest))

## v3.0.6 (2021-05-31)

#### :bug: Bug Fix
* [#450](https://github.com/adopted-ember-addons/ember-file-upload/pull/450) Fix this-property-fallback deprecation ([@aoumiri](https://github.com/aoumiri))

#### :house: Internal
* [#439](https://github.com/adopted-ember-addons/ember-file-upload/pull/439) Drop Code Climate integration ([@gilest](https://github.com/gilest))

#### Committers: 3
- Anass OUMIRI ([@aoumiri](https://github.com/aoumiri))
- Giles Thompson ([@gilest](https://github.com/gilest))
- Ilya Radchenko ([@knownasilya](https://github.com/knownasilya))

## v3.0.5 (2020-08-01)

#### :bug: Bug Fix
* [#378](https://github.com/adopted-ember-addons/ember-file-upload/pull/378) remove mirage FormData shim to fix fastboot error ([@gibso](https://github.com/gibso))

#### :memo: Documentation
* [#360](https://github.com/adopted-ember-addons/ember-file-upload/pull/360) docs: update selectFiles code samples ([@newyork-anthonyng](https://github.com/newyork-anthonyng))

#### :house: Internal
* [#353](https://github.com/adopted-ember-addons/ember-file-upload/pull/353) test for CSP compliance ([@jelhan](https://github.com/jelhan))
* [#381](https://github.com/adopted-ember-addons/ember-file-upload/pull/381) generate code coverage report only once per CI run ([@jelhan](https://github.com/jelhan))
* [#380](https://github.com/adopted-ember-addons/ember-file-upload/pull/380) floating dependency scenario must ignore lockfile ([@jelhan](https://github.com/jelhan))

#### Committers: 3
- Anthony Ng ([@newyork-anthonyng](https://github.com/newyork-anthonyng))
- Jeldrik Hanschke ([@jelhan](https://github.com/jelhan))
- Oliver Görtz ([@gibso](https://github.com/gibso))

## v3.0.4 (2020-05-06)

#### :bug: Bug Fix
* [#355](https://github.com/adopted-ember-addons/ember-file-upload/pull/355) fix: allow uploading a File without a Queue ([@alexlafroscia](https://github.com/alexlafroscia))

#### Committers: 1
- Alex LaFroscia ([@alexlafroscia](https://github.com/alexlafroscia))

## v3.0.3 (2020-04-15)

#### :bug: Bug Fix
* [#346](https://github.com/adopted-ember-addons/ember-file-upload/pull/346) build targets for doc app should cover a wider browser range ([@jelhan](https://github.com/jelhan))

#### :house: Internal
* [#320](https://github.com/adopted-ember-addons/ember-file-upload/pull/320) do not pin dependencies ([@jelhan](https://github.com/jelhan))

#### Committers: 1
- Jeldrik Hanschke ([@jelhan](https://github.com/jelhan))

## v3.0.2 (2020-03-14)

#### :bug: Bug Fix
* [#333](https://github.com/adopted-ember-addons/ember-file-upload/pull/333) Add edge to build targets for docs app ([@ndekeister-us](https://github.com/ndekeister-us))

#### :memo: Documentation
* [#333](https://github.com/adopted-ember-addons/ember-file-upload/pull/333) Add edge to build targets for docs app ([@ndekeister-us](https://github.com/ndekeister-us))

#### Committers: 1
- Nathanaël Dekeister ([@ndekeister-us](https://github.com/ndekeister-us))

## v3.0.1 (2020-03-13)

#### :memo: Documentation
* [#327](https://github.com/adopted-ember-addons/ember-file-upload/pull/327) Improve YUIDoc comments and fix build warnings ([@gilest](https://github.com/gilest))

#### Committers: 2
- Giles Thompson ([@gilest](https://github.com/gilest))
- Jeldrik Hanschke ([@jelhan](https://github.com/jelhan))

## v3.0.0 (2020-03-12)

### Upgrade Guide

`upload` test helper has been renamed to `selectFiles` and could only be imported from `ember-file-upload/test-support`.

These imports are not supported anymore:

```js
import { upload } from 'ember-file-upload/test-support';
import upload from '<app-name>/tests/helpers/upload';
```

Please change both of them to:

```js
import { selectFiles } from 'ember-file-upload/test-support';
```

The new `selectFiles` test helper expects a selector as first and one or many files as additional arguments. It does not take a file name as an argument. Please set the file name on the `File` instance:

```js
await selectFiles('#selector', new File([], 'empty.txt'));
```

Please find more details in the [updated documentation for testing](https://adopted-ember-addons.github.io/ember-file-upload/docs/testing).

#### :boom: Breaking Change
* [#319](https://github.com/adopted-ember-addons/ember-file-upload/pull/319) Drop official support for Internet Explorer 11 ([@jelhan](https://github.com/jelhan))
* [#322](https://github.com/adopted-ember-addons/ember-file-upload/pull/322) Renamed `upload` test helper to `selectFiles` and dropped support for legacy import at `app/tests/helpers/upload` ([@gilest](https://github.com/gilest))
* [#308](https://github.com/adopted-ember-addons/ember-file-upload/pull/308) Drop support for node 8 ([@gilest](https://github.com/gilest))
* [#275](https://github.com/adopted-ember-addons/ember-file-upload/pull/275) Drop support for Ember 2.16 / helpful error message if invalid image is provided to mirage handler ([@jelhan](https://github.com/jelhan))
* [#276](https://github.com/adopted-ember-addons/ember-file-upload/pull/276) Enable dropdown without upload ([@gilest](https://github.com/gilest))
* [#257](https://github.com/adopted-ember-addons/ember-file-upload/pull/257) Drop Node 6 support ([@Alonski](https://github.com/Alonski))

#### :rocket: Enhancement
* [#275](https://github.com/adopted-ember-addons/ember-file-upload/pull/275) helpful error message if invalid image is provided to mirage handler ([@jelhan](https://github.com/jelhan))
* [#274](https://github.com/adopted-ember-addons/ember-file-upload/pull/274) request params are not passed through to mirage handler ([@jelhan](https://github.com/jelhan))
* [#276](https://github.com/adopted-ember-addons/ember-file-upload/pull/276) Enable dropdown without upload ([@gilest](https://github.com/gilest))

#### :bug: Bug Fix
* [#274](https://github.com/adopted-ember-addons/ember-file-upload/pull/274) request params are not passed through to mirage handler ([@jelhan](https://github.com/jelhan))
* [#254](https://github.com/adopted-ember-addons/ember-file-upload/pull/254) Prevent trying to call splice on an array key that might not exist ([@happydude](https://github.com/happydude))

#### :memo: Documentation
* [#321](https://github.com/adopted-ember-addons/ember-file-upload/pull/321) Reconfigure addon-docs ([@gilest](https://github.com/gilest))
* [#296](https://github.com/adopted-ember-addons/ember-file-upload/pull/296) fixed missing closing bracket in documentation ([@maximilianmeier](https://github.com/maximilianmeier))
* [#291](https://github.com/adopted-ember-addons/ember-file-upload/pull/291) fix triple curly in file-dropzone doc ([@mcfiredrill](https://github.com/mcfiredrill))
* [#281](https://github.com/adopted-ember-addons/ember-file-upload/pull/281) Update addon docs and remove docs from readme ([@gilest](https://github.com/gilest))
* [#277](https://github.com/adopted-ember-addons/ember-file-upload/pull/277) Fix Travis CI Badge URL ([@gilest](https://github.com/gilest))

#### :house: Internal
* [#294](https://github.com/adopted-ember-addons/ember-file-upload/pull/294) Remove DisableGPU from Testem ([@Alonski](https://github.com/Alonski))
* [#309](https://github.com/adopted-ember-addons/ember-file-upload/pull/309) automate releases ([@jelhan](https://github.com/jelhan))
* [#307](https://github.com/adopted-ember-addons/ember-file-upload/pull/307) Remove observers ([@gilest](https://github.com/gilest))
* [#305](https://github.com/adopted-ember-addons/ember-file-upload/pull/305) Update dependencies in attempt to fix Ember Try test builds ([@gilest](https://github.com/gilest))
* [#287](https://github.com/adopted-ember-addons/ember-file-upload/pull/287) Dedup default property values in BaseComponent ([@gilest](https://github.com/gilest))
* [#285](https://github.com/adopted-ember-addons/ember-file-upload/pull/285) Set default branch to Master ([@Alonski](https://github.com/Alonski))
* [#278](https://github.com/adopted-ember-addons/ember-file-upload/pull/278) convert line endings CRLF -> LF ([@jelhan](https://github.com/jelhan))

#### Committers: 6
- Alon Bukai ([@Alonski](https://github.com/Alonski))
- Giles Thompson ([@gilest](https://github.com/gilest))
- Jason Davis ([@happydude](https://github.com/happydude))
- Jeldrik Hanschke ([@jelhan](https://github.com/jelhan))
- Maximilian Meier ([@maximilianmeier](https://github.com/maximilianmeier))
- Tony Miller ([@mcfiredrill](https://github.com/mcfiredrill))

# Ember File Upload Changelog

## v2.7.0 (2019-05-15)

#### :bug: Bug Fix
* [#236](https://github.com/adopted-ember-addons/ember-file-upload/pull/236) Fix computed-property.override deprecation ([@andreyfel](https://github.com/andreyfel))
* [#231](https://github.com/adopted-ember-addons/ember-file-upload/pull/231) Fix MIME type checks ([@bendemboski](https://github.com/bendemboski))

#### :memo: Documentation
* [#208](https://github.com/adopted-ember-addons/ember-file-upload/pull/208) Angle brackets ([@maxwondercorn](https://github.com/maxwondercorn))

#### :house: Internal
* [#233](https://github.com/adopted-ember-addons/ember-file-upload/pull/233) add CONTRIBUTING.md and Table of Contents ([@hakilebara](https://github.com/hakilebara))

#### Committers: 6
- Alon Bukai ([@Alonski](https://github.com/Alonski))
- Andrey Fel ([@andreyfel](https://github.com/andreyfel))
- Ben Demboski ([@bendemboski](https://github.com/bendemboski))
- Frédéric Soumaré ([@hakilebara](https://github.com/hakilebara))
- Raido Kuli ([@raido](https://github.com/raido))
- maxwondercorn ([@maxwondercorn](https://github.com/maxwondercorn))


## v2.6.0 (2019-01-30)

#### :bug: Bug Fix
* [#204](https://github.com/adopted-ember-addons/ember-file-upload/pull/204) Added a possibility to run tests that use 'upload' test-helper in Microsoft browsers ([@kazimirchuk](https://github.com/kazimirchuk))
* [#200](https://github.com/adopted-ember-addons/ember-file-upload/pull/200) files that were cancelled can be uploaded again ([@toovy](https://github.com/toovy))

#### :house: Internal
* [#199](https://github.com/adopted-ember-addons/ember-file-upload/pull/199) Adopt addon under new ownership ([@Alonski](https://github.com/Alonski))

#### Committers: 3
- Alon Bukai ([@Alonski](https://github.com/Alonski))
- Leks Kazimirchuk ([@kazimirchuk](https://github.com/kazimirchuk))
- Tobias Braner ([@toovy](https://github.com/toovy))


## 2.2.5 (2018-03-01)

#### :bug: Bug Fix
* [#111](https://github.com/adopted-ember-addons/ember-file-upload/pull/111) Support for files without extension. e.g: "FILE" ([@janmisek](https://github.com/janmisek))

#### Committers: 2
- Jan Míšek ([@janmisek](https://github.com/janmisek))
- Tim Evans ([@tim-evans](https://github.com/tim-evans))


## 2.2.4 (2017-11-30)

#### :bug: Bug Fix
* [#87](https://github.com/adopted-ember-addons/ember-file-upload/pull/87) fix upload promise not being cancellable ([@dwickern](https://github.com/dwickern))
* [#88](https://github.com/adopted-ember-addons/ember-file-upload/pull/88) fix deprecated ember-metal imports ([@dwickern](https://github.com/dwickern))

#### Committers: 1
- Derek Wickern ([@dwickern](https://github.com/dwickern))


## 2.2.1 (2017-11-27)

#### :bug: Bug Fix
* [#82](https://github.com/adopted-ember-addons/ember-file-upload/pull/82) uploadPromise.then was lost as it was not returned ([@janmisek](https://github.com/janmisek))

#### Committers: 2
- Jan Míšek ([@janmisek](https://github.com/janmisek))
- Tim Evans ([@tim-evans](https://github.com/tim-evans))


## 2.2.0 (2017-11-09)

#### :bug: Bug Fix
* [#79](https://github.com/adopted-ember-addons/ember-file-upload/pull/79) Fix for #42 -- Changed logic on file type array ([@donaldwasserman](https://github.com/donaldwasserman))

#### Committers: 3
- Donald Wasserman ([@donaldwasserman](https://github.com/donaldwasserman))
- Felipe Buenaño ([@fesebuv](https://github.com/fesebuv))
- Tristan Toye ([@TristanToye](https://github.com/TristanToye))


## 2.1.3 (2017-10-26)

#### :rocket: Enhancement
* [#74](https://github.com/adopted-ember-addons/ember-file-upload/pull/74) Add support for circle svg element ([@dbbk](https://github.com/dbbk))

#### :bug: Bug Fix
* [#60](https://github.com/adopted-ember-addons/ember-file-upload/pull/60) file.upload returns the promise created in http-request.js ([@bartocc](https://github.com/bartocc))

#### :memo: Documentation
* [#66](https://github.com/adopted-ember-addons/ember-file-upload/pull/66) fix syntax error on acceptance test code example ([@hakilebara](https://github.com/hakilebara))
* [#65](https://github.com/adopted-ember-addons/ember-file-upload/pull/65) fix definitions of {{file-dropzone}} attributes ([@hakilebara](https://github.com/hakilebara))

#### Committers: 3
- Ben King ([@dbbk](https://github.com/dbbk))
- Frédéric Soumaré ([@hakilebara](https://github.com/hakilebara))
- Julien Palmas ([@bartocc](https://github.com/bartocc))


## 2.1.2 (2017-09-26)

#### :bug: Bug Fix
* [#63](https://github.com/adopted-ember-addons/ember-file-upload/pull/63) FF does not seem to have `dataTransfer` on dragleave ([@topaxi](https://github.com/topaxi))

#### :memo: Documentation
* [#55](https://github.com/adopted-ember-addons/ember-file-upload/pull/55) Replace references to service 'uploader' with 'fileQueue' ([@Subtletree](https://github.com/Subtletree))
* [#49](https://github.com/adopted-ember-addons/ember-file-upload/pull/49) Update README.md - fix integration example ([@bartocc](https://github.com/bartocc))

#### Committers: 3
- Damian Senn ([@topaxi](https://github.com/topaxi))
- Julien Palmas ([@bartocc](https://github.com/bartocc))
- Ryan Scott ([@Subtletree](https://github.com/Subtletree))


## 2.1.1 (2017-07-17)

#### :bug: Bug Fix
* [#48](https://github.com/adopted-ember-addons/ember-file-upload/pull/48) Add ability to upload same file twice in a row ([@mickeysanchez](https://github.com/mickeysanchez))

#### Committers: 1
- Mickey Sanchez ([@mickeysanchez](https://github.com/mickeysanchez))


## 2.1.0 (2017-07-16)

#### :rocket: Enhancement
* [#47](https://github.com/adopted-ember-addons/ember-file-upload/pull/47) feat(http-request): add jsonapi content type ([@shuriu](https://github.com/shuriu))

#### Committers: 1
- Ștefan Rotariu ([@shuriu](https://github.com/shuriu))


## 2.0.1 (2017-07-16)

#### :bug: Bug Fix
* [#46](https://github.com/adopted-ember-addons/ember-file-upload/pull/46) fix(file): file.upload() returns a promise ([@shuriu](https://github.com/shuriu))

#### Committers: 1
- Ștefan Rotariu ([@shuriu](https://github.com/shuriu))


## 2.0.0 (2017-07-12)

#### :rocket: Enhancement
* [#12](https://github.com/adopted-ember-addons/ember-file-upload/pull/12) Add payloadType option to file ([@jlevycpa](https://github.com/jlevycpa))

#### Committers: 1
- [@jlevycpa](https://github.com/jlevycpa)


## 2.0.0-beta.42 (2017-06-05)

#### :memo: Documentation
* [#40](https://github.com/adopted-ember-addons/ember-file-upload/pull/40) fix try catch example ([@bbtb1982](https://github.com/bbtb1982))

#### Committers: 1
- Brandon Richards  ([@bbtb1982](https://github.com/bbtb1982))


## 2.0.0-beta.41 (2017-05-11)

#### :rocket: Enhancement
* [#37](https://github.com/adopted-ember-addons/ember-file-upload/pull/37) 'disabled' attribute for file-upload ([@XaserAcheron](https://github.com/XaserAcheron))

#### Committers: 1
- Xaser Acheron ([@XaserAcheron](https://github.com/XaserAcheron))


## 2.0.0-beta.39 (2017-04-21)

#### :bug: Bug Fix
* [#32](https://github.com/adopted-ember-addons/ember-file-upload/pull/32) nullify _listener after file drop ([@EnotPoloskun](https://github.com/EnotPoloskun))

#### Committers: 1
- Pavel ([@EnotPoloskun](https://github.com/EnotPoloskun))


## 2.0.0-beta.37 (2017-03-31)

#### :rocket: Enhancement
* [#28](https://github.com/adopted-ember-addons/ember-file-upload/pull/28) Permit setting withCredentials on the XMLHttpRequest for file-upload ([@zacharyhamm](https://github.com/zacharyhamm))

#### Committers: 1
- Zachary Hamm ([@zacharyhamm](https://github.com/zacharyhamm))


## 2.0.0-beta.36 (2017-03-21)

#### :rocket: Enhancement
* [#27](https://github.com/adopted-ember-addons/ember-file-upload/pull/27) Fix remove to clear file from fileQueue also ([@dkorenblyum](https://github.com/dkorenblyum))

#### Committers: 1
- Dmitriy Korenblyum ([@dkorenblyum](https://github.com/dkorenblyum))


## 2.0.0-beta.35 (2017-03-17)

#### :bug: Bug Fix
* [#26](https://github.com/adopted-ember-addons/ember-file-upload/pull/26) Do not call set on a destroyed object ([@dkorenblyum](https://github.com/dkorenblyum))

#### Committers: 1
- Dmitriy Korenblyum ([@dkorenblyum](https://github.com/dkorenblyum))


## 2.0.0-beta.27 (2017-02-05)

#### :bug: Bug Fix
* [#22](https://github.com/adopted-ember-addons/ember-file-upload/pull/22) Closes [#21](https://github.com/adopted-ember-addons/ember-file-upload/issues/21) Drag-and-drop isn't working with IE11 ([@chrisdpeters](https://github.com/chrisdpeters))

#### Committers: 2
- Chris Peters ([@chrisdpeters](https://github.com/chrisdpeters))
- Edward Faulkner ([@ef4](https://github.com/ef4))


## 2.0.0-beta.19 (2016-10-17)

#### :bug: Bug Fix
* [#15](https://github.com/adopted-ember-addons/ember-file-upload/pull/15) Closes [#14](https://github.com/adopted-ember-addons/ember-file-upload/issues/14) (Maximum call stack size exceeded) ([@Padchi](https://github.com/Padchi))

#### Committers: 2
- Tim Evans ([@tim-evans](https://github.com/tim-evans))
- Timmie Sarjanen ([@Padchi](https://github.com/Padchi))


## 2.0.0-beta.17 (2016-09-22)

#### :bug: Bug Fix
* [#11](https://github.com/adopted-ember-addons/ember-file-upload/pull/11) Add null check for onfileadded callback ([@jlevycpa](https://github.com/jlevycpa))

#### Committers: 1
- [@jlevycpa](https://github.com/jlevycpa)


## 2.0.0-beta.16 (2016-08-04)

#### :rocket: Enhancement
* [#8](https://github.com/adopted-ember-addons/ember-file-upload/pull/8) Get progress from `request.upload.onprogress` as well. ([@ryanto](https://github.com/ryanto))

#### :memo: Documentation
* [#6](https://github.com/adopted-ember-addons/ember-file-upload/pull/6) Fix installation instructions ([@kylemellander](https://github.com/kylemellander))

#### Committers: 2
- Kyle Mellander ([@kylemellander](https://github.com/kylemellander))
- Ryan T ([@ryanto](https://github.com/ryanto))


## 1.13.13 (March 15, 2016)
* Add an API for mocking out file.read() for `ember-plupload/test-helpers`.
* Update ember-cli

## 1.13.12 (February 5, 2016)
* Assert that the browse button is in the DOM before trying to initialize the uploader.

## 1.13.11 (January 26, 2016)
* Fix drag-and-drop cases where the drag-out event is never handled. (Courtesy of @raytiley)

## 1.13.10 (December 9, 2015)
* Fix cases where Chrome would asynchronously load the `document.styleSheet`, causing ember-plupload to mess with app styles. (Courtesy of @mixonic)

## 1.13.9 (November 19, 2015)
* Add acceptance test helper `addFiles` and documentation.

## 1.13.8 (November 18, 2015)
* Use observable methods for the uploader service so properties properly get updated (`files`, `size`, `loaded`, and `progress`). (Courtesy of @schwabix)
* Start of polyfill work for making uploads work on mobile devices.

## 1.13.7 (October 26, 2015)
* Expose plupload internals through `onInitOfUploader` action. This is a stop-gap measure for mobile support, which may be superceded by support in the addon to handle it transparently. (courtesy of @cooperjbrandon)
* Support Ember 2.x and 1.x initializers (courtesy of @Kulja)

## 1.13.6 (August 14, 2015)
* Fixes a bug where drag and drop stopped working when `no-duplicates` was set to true. Courtesy of @cooperjbrandon

## 1.13.5 (August 14, 2015)
* Fixes a bug where the the uploader button's position wasn't invalidated when files are added / removed from the queue. Courtesy of @knownasilya

## 1.13.4 (August 12, 2015)
* Update blueprints to work with new function signature for `addBowerPackageToProject`. See https://github.com/ember-cli/ember-cli/pull/4643 for more information on these changes. Courtesy of @deathbearbrown

## 1.13.3 (August 12, 2015)
* Update plupload to [2.1.8](https://github.com/moxiecode/plupload/releases/tag/v2.1.8). Included below are the changelog to mOxie and plupload:

#### Plupload v2.1.4
* Fix: don't cancel current upload on generic file error
* Update moxie to [v1.3](https://github.com/moxiecode/moxie/releases/tag/v1.3)

#### Moxie v1.3
(last minor version to target Flash Player 10.3)

* FileInput, HTML5: Allow multiple file upload on iOS 8+.
* FileInput, HTML5: Where possible filter files by extensions, instead of mime types.
* Encode, Utils: Fix btoa() to properly interpret multi-byte strings.
* FileInput/FileDrop: Unbind all events on destroy.
* Image, HTML5/Flash/Silverlight: Properly extract RATIONAL/SRATIONAL types.
* Runtime, Flash: Make sure SWF is properly removed in IE on destroy.
* FileReader, Silverlight: Constrain conversion of the buffer to amount of bytes that it actually contains.
* Image/Jpeg, HTML5: Survive the cases when there's no embedded thumb.
* Image, HTML5: Extract embedded thumb from JPEG, when available.
* RuntimeClient: Letter-case of the runtime identifier, shouldn't matter.
* FileInput, HTML5: Set relativePath on the File object when it's available (when folder is selected in WebKit).

#### Plupload v2.1.8
* Fix event binding/unbinding logic by partially reverting it.
* Fix UA parser bug that made v2.1.5 unusable.
* Update moxie to [v1.3.4](https://github.com/moxiecode/moxie/releases/tag/v1.3.4)

#### Moxie v1.3.4
* Image, HTML5: Refactor ExifParser, mostly to survive invalid meta data.
* Utils, Env: ua-parser-js has dropped MAJOR version property.
* Utils, Url: Fix resolveUrl() regression.
* Utils, Basic: Fix each() regression.
* Image, Flash/Silverlight: Fix thumb extraction regression.

## 1.13.2 (August 10, 2015)
* Fix a bug introduced in 1.13.1 where dropzones were always marked as active.

## 1.13.1 (August 10, 2015)
* Add support for Ember 2.0.0-beta.5. This removes deprecated API calls from the addon (`Ember.keys`, `Ember.Enumerable.filterProperty`, `Ember.Enumerable.findProperty`).

## 1.13.0 (July 13, 2015)
* Allow files to be retried. Call `upload` on files that you'd like to try again to retry them.
* [BREAKING CHANGE] Remove deprecated code. All deprecations from 0.8.1 and below are removed, along with old behavior. Please upgrade to 0.8.1 before upgrading to 1.13.0 to ensure that there are no deprecation warnings.

## 0.8.1 (July 7, 2015)
* Fix HTML4 runtimes by conditionally adding drag and drop params to the uploader.
* Remove long timeouts before starting the upload in the `file.upload` method.

## 0.8.0 (July 6, 2015)
* Change 'when-queued' action handler to 'onfileadd'. This also adds an error handler called 'onerror'.

## 0.7.0 (July 6, 2015)
* Change UploadQueueManager to a service called Uploader with various aggregate properties about all files uploading.

## 0.6.23 (July 6, 2015)
* Fix file uploads for IE9 by increasing the queue timeout to 100ms. Courtesy of @mgrigis

## 0.6.22 (June 30, 2015)
* Handle code paths for beta versions of plupload. Some users of ember-plupload are using this in the wild. Courtesy of @walter

## 0.6.21 (June 14, 2015)
* Allow any 2XX series status to resolve the file upload
* Headers are case-insensitive, which meant that sometimes responses weren't parsed correctly. Courtesy of @raytiley
* Add a longer delay before uploading a file, trying to solve a race condition where settings were incorrectly reset before uploads. Courtesy of @walter

## 0.6.20 (June 12, 2015)
* Include unminified plupload and moxie for development, which helps with debugging issuse with plupload / moxie. Courtesy of @raytiley

## 0.6.19 (June 12, 2015)
* Fixes #19. Attach event listeners after the initial render is complete. This was causing browser crashes on Ember 1.13+. Courtesy of @raytiley

## 0.6.18 (June 11, 2015)
* Uploads that respond with 201s should be resolved instead of rejected. Courtesy of @raytiley

## 0.6.16 (June 3, 2015)
* 0.6.14 had a bug where the stylesheet would never be applied. This also reduces memory usage and DOM churn by sharing the stylesheet across all instances of the uploader.

## 0.6.14 (June 3, 2015)
* Use extracted dynamic stylesheet library, named dinosheets, for disabling pointer events on the dropzone. Installing the new version should properly add the library to your `bower.json`.

## 0.6.12 (May 28, 2015)
* Allow only an url to be passed to upload without any additional options.

## 0.6.11 (May 26, 2015)
* Add deprecation warnings for users of the old syntax (from 0.5.1).
* Remove deprecations for the new computed property syntax. Support for older versions of ember that do not support this will be dropped in 1.0.0.

## 0.6.10 (May 25, 2015)
* Monkeypatch plupload to take references to the drop_element and browse_button so parts of the interface can be conditionally shown / hidden without breaking the buttons.

## 0.6.9 (May 25, 2015)
* Reset `progress` when all files have finished uploading in the queue.

## 0.6.8 (May 25, 2015)
* Always trigger the `when-queued` event even if the file is invalid. Promise returning functions `read` and `upload` will always be rejected with the error.
* Expose `refresh` on the queue for those having trouble with misaligned plupload input masks. Internally, the uploader will try to refresh the position of the mask at times where there might be changes in templates.

## 0.6.7 (May 24, 2015)
* Rename `features` to `dropzone` (with an alias setup for features).
* Fix #14 by patching dragenter and dragleave events
* Apply `pointer-events: none` to all children of the dropzone so dragenter and dragleave events are stable.

## 0.6.5 (May 24, 2015)
* Set `Content-Type` in the headers if the file is being sent as a binary blob, otherwise, stick it into the multipart_params. These defaults allow for easy integration with uploading directly to S3.

## 0.6.4 (May 24, 2015)
* #13 Fix dropzone hover events

## 0.6.3 (May 23, 2015)
* Simplify the interface to deal with drag and drop. This doesn't change the current semantics, but the old style semantics will be dropped in a future release. The `features.drag-and-drop` is flattened onto the second yield param and has the properties `id`, `enabled`, `valid`, and `active`.
* Add `for-dropzone` so uploaders can easily use the `<body>` element as their dropzone.

## 0.6.2 (May 23, 2015)
* `contentType` is now sent in the multipart_params by default. Otherwise, the `Content-Type` of the form submission would be overriden and the file simply wouldn't upload.

## 0.6.1 (May 19, 2015)
* Update plupload bower component.
* Allow settings to be unset when uploading. (For example, some users may not want to have the `Content-Type` header sent)

## 0.6.0 (May 12, 2015)
* #9 [BREAKING CHANGE] The `contentType` property now refers to the actual content type of the file to send. Use the `multipart` setting to determine whether the file will be sent in multiple parts using form data, or whether it's sent as a binary blob

## 0.5.1 (May 9, 2015)
* #9 [BREAKING CHANGE] `pl-uploader` components no longer accept the following attributes: `action`, `headers`, `accept`, `send-file-as`, `multipart-params`, `max-retries`, `chunk-size`, and `file-key`. These properties must now be sent via the `upload` method on files passed to the `when-queued` action.
