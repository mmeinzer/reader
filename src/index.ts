import fs from "fs";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

fs.readFile("out3.html", "utf8", function (err, data) {
  if (err) throw err;

  var doc = new JSDOM(data);
  let reader = new Readability(doc.window.document);
  let article = reader.parse();

  console.log(article?.content);
});
