# Changelog 

## Release 0.1.6

- introduce code coverage and github action testing

## Release 0.1.5

- add file and comment deletion
- workspaces and collections are stored in maps now for faster access
- introduced eslint and fixed all basic linting issues
- import all commonly used types and classes directly from the package thanks to re-exports
- add user access management
- reworked collection ORM
  - decoupled from collection
  - allow to pass ORM collection type to `collection()` to receive a collection with typed field entries
- add helpers for string formatting

## Release 0.1.4

- add createWebhook to Workspace, Collection and Entry
- add collection filter to zenkit object
- add workspace property to zenkit object to discover workspaces easily
- rename private workspaces field in zenkit to _workspaces
- addFile, uploadFile, comment available on Workspace, Collection and Entry

## Release 0.1.3

- Set Zenkit-API-Key in axios requests only when requests go to Zenkit BASE_URL
- Extend comment capabilities for Entry

## Release 0.1.2

Intial release with rudimentary funtionality for GIF services