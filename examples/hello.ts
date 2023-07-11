import CategoriesField from "../src/fields/categories";
import Zenkit from "../src/zenkit";

enum STATUS_FIELD {
  ZU_BEARBEITEN = 13389240,
  IN_BEARBEITUNG = 13389241,
  ERLEDIGT = 13389242,
}

enum TAG_FIELD {
  NEW = 13391152,
  STALE = 13391153,
  UNCONFIRMED = 13391154,
  BUG = 13391155,
}

const main = async () => {
  const zenkit = await Zenkit.createAsync();
  console.log(zenkit.my.fullname);
  const workspace = zenkit.workspace("Test.*space")!;
  console.log(workspace.name);
  console.log(workspace.listCollections());
  const collection = workspace?.collection(3207438)!;
  await collection.populate();
  console.log(collection.primaryKey);
  console.log(collection.listEntries());
  // console.log(collection.data);
  const workspaceUsers = await workspace.listUsers();
  console.log(workspaceUsers);
  const alex = workspaceUsers.find((user) => user.initials === "AN")!;
  // const comments = await collection.getComments();
  // await collection.addFile("./picture_new.jpg");
  // await collection.comment("", "353025eb-628c-40d2-9207-c68f4bc5c7e0", 8431159);
  // console.log(await listUserWebhooks(alex));
  // const webhooks = await collection.listWebhooks();
  // console.log(webhooks);
  // console.log(collection.id);
  // await silenceAll();
  // await collection.createCommentWebhook(
  //   "https://zenkit.bixd.de/v1/lists/12345/activities"
  // );

  // await collection.addUser(alex);
  // await collection.removeUser(alex);
  // console.log(await collection.removeUser());
  // console.log(await collection.addUser());
  // const entry = collection.entry(1)!;
  // console.log(entry.listFieldNames());
  // const status_field = entry.field("Status Field") as CategoriesField;
  // console.log(status_field.element.getTypeScriptEnum());
  // const category = status_field.element.label("In Bearbeitung")!;
  // const tags_field = entry.field("Tag Field") as CategoriesField;
  // console.log(tags_field.element.getTypeScriptEnum());

  // const tempEntry = collection.entry("Ein temporärer Eintrag")!;
  // console.log(await tempEntry.getComments());
  // await tempEntry.comment("This is a test");
  // if (tempEntry !== null) {
  //   await tempEntry.delete();
  // }
  // const newEntry = await collection.createEntry("Ein temporärer Eintrag");
  // let field = newEntry.field("Status Field") as CategoriesField;
  // field.addLabel(category.id);
  // await newEntry.commit();
  // field.addLabel(STATUS_FIELD.ERLEDIGT);
  // field = newEntry.field("Tag Field") as CategoriesField;
  // field.addLabel(TAG_FIELD.BUG);
  // field.addLabel(TAG_FIELD.NEW);
  // await newEntry.commit();
  // field.removeLabel(TAG_FIELD.BUG);
  // await newEntry.commit();
  // await newEntry.comment("This is a test");
};

main();
