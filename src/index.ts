import { initDrop } from "./dropHandler";
import { setupPage } from "./handlers";


setupPage()
  .then(ctx => {
    initDrop(ctx)
  })
  .catch(err => console.error(err))
