# Changelog

All notable changes to node-semvers are documented here.

## [1.9.0] - 2026-11-18

### Changed

- Refreshed release lists are saved to `~/.node-semvers/cache/v1/`, one copy shared by every project on the machine, instead of inside the installed package. `load` and `loadSync` read whichever is newer, that copy or the one shipped with the package. This fixes `load` failing with `EACCES` or `EROFS` when the package is installed where you cannot write (a root-owned global install, Yarn PnP).
- The home folder must be writable. If it is read-only or missing, `load` fails whenever a refresh is needed, with an error naming the folder and the `cachePath` option; `loadSync` still reads the shipped copy. Nothing in the home folder is deleted automatically.
- A response that is not the Node.js release list (a sign-in page, an error body) is now an error and is not saved.
