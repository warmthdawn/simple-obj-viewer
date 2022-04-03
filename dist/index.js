import {initDrop} from "./dropHandler.js";
import {setupPage} from "./handlers.js";
setupPage().then((ctx) => {
  initDrop(ctx);
}).catch((err) => console.error(err));
