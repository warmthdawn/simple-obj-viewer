import {ObjectModel} from "./Context.js";
export function initDrop(ctx) {
  const viewbox = document.getElementById("canvas-parent");
  if (!viewbox) {
    return;
  }
  viewbox.addEventListener("dragenter", (ev) => {
    viewbox.classList.add("masked");
  });
  viewbox.addEventListener("dragover", (ev) => {
    ev.preventDefault();
  });
  viewbox.addEventListener("dragleave", (ev) => {
    viewbox.classList.remove("masked");
  });
  viewbox.addEventListener("drop", (ev) => {
    viewbox.classList.remove("masked");
    ev.preventDefault();
    if (!ev.dataTransfer) {
      return;
    }
    if (ev.dataTransfer.items) {
      for (let i = 0; i < ev.dataTransfer.items.length; i++) {
        if (ev.dataTransfer.items[i].kind === "file") {
          const file = ev.dataTransfer.items[i].getAsFile();
          if (file) {
            handleFile(ctx, file);
          }
        }
      }
    } else {
      for (let i = 0; i < ev.dataTransfer.files.length; i++) {
        handleFile(ctx, ev.dataTransfer.files[i]);
      }
    }
  });
}
function handleFile(ctx, file) {
  console.log(file.name);
  if (!file.name.endsWith(".obj")) {
    alert("不是有效的obj模型！");
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    if (reader.result) {
      const obj = reader.result;
      console.log("成功读取模型文件, 长度：" + obj.length);
      try {
        const model = new ObjectModel();
        model.load(obj);
        ctx.loadModel(model);
        document.getElementById("canvas-tooltip")?.remove();
      } catch (error) {
        alert("读取文件失败！" + error);
      }
    } else {
      alert("读取文件失败！");
    }
  };
  reader.onerror = (err) => {
    alert("读取文件失败！");
  };
  reader.readAsText(file);
}
