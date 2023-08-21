# Zenkit-SDK
[![Unit Tests](https://github.com/caretech-owl/zenkit-sdk/actions/workflows/unit_tests.yaml/badge.svg)](https://github.com/caretech-owl/zenkit-sdk/actions/workflows/unit_tests.yaml)
[![codecov](https://codecov.io/gh/caretech-owl/zenkit-sdk/branch/main/graph/badge.svg?token=GC8DDFU4I5)](https://codecov.io/gh/caretech-owl/zenkit-sdk)
[![npm](https://img.shields.io/npm/v/%40caretech-owl/zenkit-sdk)](https://www.npmjs.com/package/@caretech-owl/zenkit-sdk)

Helps you to automize tasks and create chatbots in Zenkit.

## Installation 

```
npm install @caretech-owl/zenkit-sdk
```

## Prerequisites

`zenkit-sdk` requires an API key which can be passed as an environment variable `ZENKIT_API_KEY` or inside a `.env` file.

```bash
# a) use environment variables ...
export ZENKIT_API_KEY=$YOUR_SECRET_API_KEY
# b) ... or use a .env file
echo "ZENKIT_API_KEY=$YOUR_SECRET_API_KEY" > .env
npm run <your_target>
```

## Basic Usage

```typescript

import { Zenkit } from "@caretech-owl/zenkit-sdk";

// get your user object 
const zenkit = await Zenkit.createAsync();

// retrieve a workspace, you can pass a known workspace ID
// or a regular expression 
const workspace = zenkit.workspace("[Ww]orkspace.*");
const sameWorkspace = zenkit.workspace(workspace.id);

// collections can be retrieved the same way
const collection = workspace.collection("[Cc]ollection.*")
const sameCollection = workspace.collection(collection.id)

// collection can be retrieved from your main object as well
const identicalCollection = zenkit.collection("[Cc]ollection.*")

// to retrieve entries, collections must be populated first
// otherwise they will be empty
await collection.populate()

// now entries can be retrieved by their primary key or ID
const entry = collection.entry("My (first )?[En]try")
const sameEntry = collection.entry(entry.id)

// we can comment this entry
await entry.comment("Hello World");

// we can retrieve fields and get or set their values
const textField = entry.field("A text field");
entry.field("A text field").set(`${textField.value}++`);

// entries will not be updated instantly
// you need to commit changes once you are done
await entry.commit();
```

### Webhook

```typescript
// in case you want to process events you can use webhooks
// a) in case you want to receive notifications for all comments
// in a workspace
workspace.createCommentWebhook("https://your.api/endpoint");

// b) for all commments in a collection
collection.createCommentWebhook("https://your.api/endpoint");

// c) for all comments in an entry
entry.createCommentWebhook("https://your.api/endpoint");

// webhooks can be managed from your main object. 
// if you created webhooks after you created the zenkit object,
// you need to sync it first
await zenkit.sync();
const myWebhooks = zenkit.webhooks();

// to delete a webhook you can call 'delete' on the webhook object
// this will delete the first webhook
await myWebhooks[0].delete();
```

You can also create webhooks directly in case you need more control about what kind of event you need to listen to:
```typescript
import { Zenkit, Webhook, TriggerType } from "@caretech-owl/zenkit-sdk";

await Webhook.createWebhook(
    "https://your.api/path",
    TriggerType.ACTIVITY,
    workspaceId,
    listId,
    listEntryId
)
```