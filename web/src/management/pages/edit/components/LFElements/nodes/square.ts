import { BaseNodeModel, h, RectNode, RectNodeModel } from '@logicflow/core'

export class SquareModel extends RectNodeModel {
  setAttributes() {
    const size = 80

    this.width = size
    this.height = size
    // this.anchorsOffset = [
    //   [size / 2, 0],
    //   [-size / 2, 0]
    // ]
  }
}

export class SquareView extends RectNode {
  getTextStyle() {
    const { model } = this.props

    const style = model.getTextStyle()
    const {
      model: { properties = {} }
    } = this.props
    if (properties.isUsed) {
      style.color = 'red'
    }
    return style
  }

  // getShape 的返回值是一个通过 h 方法创建的 svg 元素
  getShape() {
    const { x, y, width, height } = this.props.model
    const { fill, stroke, strokeWidth } = this.props.model.getNodeStyle()
    const attrs = {
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
      stroke,
      fill,
      strokeWidth
    }
    // 使用 h 方法创建一个矩形
    return h('g', {}, [
      h('rect', { ...attrs }),
    ])
  }
}

export default {
  type: 'square',
  view: SquareView,
  model: SquareModel
}
