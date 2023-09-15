# Changelog 

## Release 0.2.3

- Collection.getUser without role will return workspace users as well when the collection is visible
- added ID field to File object

## Release 0.2.2

- introduce File class to improve file handling
- extend Documentation with Basic Usage
- add getFile for collections and collections of workspaces;
  - workspace files are not found (yet)
- webhook path can now be set in config
- webhooks can be retrieved from Zenkit object
- added more trigger types for activity filter

## Release 0.2.1

- generalize Comments to Actitivies [W/C/E]
- Split IChatRoom from (manageable) IChatGroup
- Entry is also a ChatRoom
- filtering chat(groups) uses regex as well now

## Release 0.2.0

- refactored data access and removed all (unneccessary) data 'views'
- allow data fields to return more than one value; required for DataFields with 'endDate' and 'hasTime'
- enhanced DataField capabilities with setEndDate and automatically set 'hasTime'
- allow sorting of entries by a passed sort functions

## Release 0.1.8

- improved handling of chat room users
- add name to chatroom interface
- user resourceTags instead of incomplete chat attribute

## Release 0.1.7

- moved generateORM back to Collection
- improve Webhook handling
- improved user permission/access handling
- switch to chat.zenkit user endpoint for 'chat' attribute

## Release 0.1.6

- introduce codecov and github action unit testing
- extend linting rules
- fix errors in ORM generation
- add Github badges
- create new mocked data
- add IChat interface

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