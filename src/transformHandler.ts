import { mat4, vec2, vec3 } from "gl-matrix"
import type { Context } from "./Context"

export class Transform {
    translateX = 0
    translateY = 0
    translateZ = 0
    scale = 0

    rotation = mat4.create()


}


function getMousePos(event: MouseEvent, canvas: HTMLCanvasElement) {
    return [
        2 * event.clientX / canvas.width - 1,
        2 * (canvas.height - event.clientY) / canvas.height - 1
    ]
}

function getMouseAction(select: HTMLElement) {
    for (const option of select.children) {
        if (option instanceof HTMLOptionElement && option.selected) {
            return option.value
        }
    }
    return ''
}

const rotateSpeed = 1


export function setupTransformHandler(ctx: Context, cavans: HTMLCanvasElement) {
    let dragging = false
    let x0 = 0
    let y0 = 0
    const select = document.getElementById("actionType")!;
    let leftClick = true;

    cavans.addEventListener('wheel', ev => {
        ev.preventDefault()
        ctx.transform.scale += ev.deltaY / 1000
    }, { passive: true })

    cavans.addEventListener('click', ev => {
        ev.preventDefault()
        return false
    })
    cavans.addEventListener('contextmenu', ev => {
        ev.preventDefault()
        return false;
    })
    cavans.addEventListener('mousedown', ev => {
        dragging = true;
        [x0, y0] = getMousePos(ev, cavans)
        leftClick = ev.button === 0
        return false
    })

    cavans.addEventListener('mousemove', ev => {
        if (!dragging) {
            return
        }
        const [x1, y1] = getMousePos(ev, cavans)

        if (getMouseAction(select) === 'rotate') {
            const rotation = ctx.transform.rotation
            if (leftClick) {
                mat4.mul(rotation, mat4.fromYRotation(mat4.create(), (x1 - x0) * rotateSpeed), rotation)
                mat4.mul(rotation, mat4.fromXRotation(mat4.create(), -(y1 - y0) * rotateSpeed), rotation)
            } else {

                mat4.mul(rotation, mat4.fromZRotation(mat4.create(), (x1 - x0) * rotateSpeed), rotation)
            }

        } else {
            if (leftClick) {
                ctx.transform.translateY += (y1 - y0)
                ctx.transform.translateX += (x1 - x0)
            } else {
                ctx.transform.translateZ += (y1 - y0)
            }
        }
        x0 = x1
        y0 = y1

    })

    cavans.addEventListener('mouseup', ev => {
        dragging = false;
        return false
    })
}