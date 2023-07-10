import Zenkit from "../src/zenkit";

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
  const entry = collection.entry(1)!;
  console.log(entry.listFieldNames());
  const newEntry = await collection.createEntry("Ein temporärer Eintrag");
  console.log(newEntry.id);
  await newEntry.delete();
};

main();
