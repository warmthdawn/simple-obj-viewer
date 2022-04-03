import { Context, ObjectModel } from "./Context"

export function initDrop(ctx: Context) {
    const viewbox = document.getElementById("canvas-parent")
    if (!viewbox) {
        return
    }
    viewbox.addEventListener('dragenter', ev => {
        viewbox.classList.add('masked')
    })
    viewbox.addEventListener('dragover', ev => {
        ev.preventDefault()
    })
    viewbox.addEventListener('dragleave', ev => {
        viewbox.classList.remove('masked')
    })

    viewbox.addEventListener('drop', ev => {
        viewbox.classList.remove('masked')
        ev.preventDefault();
        if (!ev.dataTransfer) {
            return
        }
        if (ev.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (let i = 0; i < ev.dataTransfer.items.length; i++) {
                // If dropped items aren't files, reject them
                if (ev.dataTransfer.items[i].kind === 'file') {
                    const file = ev.dataTransfer.items[i].getAsFile();
                    if (file) {
                        handleFile(ctx, file)
                    }
                }
            }
        } else {
            // Use DataTransfer interface to access the file(s)
            for (let i = 0; i < ev.dataTransfer.files.length; i++) {
                handleFile(ctx, ev.dataTransfer.files[i])
            }
        }
    })


}

function handleFile(ctx: Context, file: File) {
    console.log(file.name)
    if (!file.name.endsWith(".obj")) {
        alert("不是有效的obj模型！")
        return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
        if (reader.result) {
            const obj = reader.result as string
            console.log("成功读取模型文件, 长度：" + obj.length);
            try {
                const model = new ObjectModel()
                model.load(obj)
                ctx.loadModel(model)
                
            } catch (error) {
                alert("读取文件失败！" + error)
            }
        } else {
            alert("读取文件失败！")
        }
    }

    reader.onerror = (err) => {
        alert("读取文件失败！")
    }
    reader.readAsText(file)

}

