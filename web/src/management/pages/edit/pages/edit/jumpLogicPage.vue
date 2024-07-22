
<template>
  <el-card header="Graph" class="logic-wrapper">
    <el-divider content-position="left">节点面板</el-divider>
    <div ref="containerRef" id="graph" class="viewport"></div>
    <!-- <TeleportContainer  class="graph"/> -->
  </el-card>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { forEach, map, has } from 'lodash-es'
import LogicFlow, { ElementState, LogicFlowUtil } from '@logicflow/core'
import { register, getTeleport } from '@logicflow/vue-node-registry'
import '@logicflow/core/es/index.css'

import ProgressNode from '@/management/pages/edit/components/LFElements/ProgressNode.vue'
import { combine, square, star, uml, user } from '@/management/pages/edit/components/LFElements/nodes'
import { animation, connection } from '@/management/pages/edit/components/LFElements/edges'


const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: true,
  stopZoomGraph: true,
  style: {
    rect: {
      rx: 5,
      ry: 5,
      strokeWidth: 2
    },
    circle: {
      fill: '#f5f5f5',
      stroke: '#666'
    },
    ellipse: {
      fill: '#dae8fc',
      stroke: '#6c8ebf'
    },
    polygon: {
      fill: '#d5e8d4',
      stroke: '#82b366'
    },
    diamond: {
      fill: '#ffe6cc',
      stroke: '#d79b00'
    },
    text: {
      color: '#b85450',
      fontSize: 12
    }
  }
}

const customTheme: Partial<LogicFlow.Theme> = {
  baseNode: {
    stroke: '#4E93F5'
  },
  nodeText: {
    overflowMode: 'ellipsis',
    lineHeight: 1.5,
    fontSize: 13
  },
  edgeText: {
    overflowMode: 'ellipsis',
    lineHeight: 1.5,
    fontSize: 13,
    textWidth: 100
  }, // 确认 textWidth 是否必传
  polyline: {
    stroke: 'red'
  },
  rect: {
    width: 200,
    height: 40
  },
  arrow: {
    offset: 4, // 箭头长度
    verticalLength: 2 // 箭头垂直于边的距离
  }
}
const data = {
  // nodes: [
  //   {
  //     id: 'custom-node-x',
  //     rotate: 1.1722738811284763,
  //     text: {
  //       x: 600,
  //       y: 200,
  //       value: 'xxxxx'
  //     },
  //     type: 'rect',
  //     x: 600,
  //     y: 200
  //   }
  // ]
}

const lfRef = ref<LogicFlow | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

const registerElements = (lf: LogicFlow) => {
  const elements = [
    // edges
    animation,
    connection,
    // nodes
    combine,
    square,
    star,
    uml,
    user
  ]

  map(elements, (customElement) => {
    lf.register(customElement)
  })
}

onMounted(() => {
  if (containerRef.value) {
    const lf = new LogicFlow({
      ...config,
      container: containerRef.value,
      // hideAnchors: true,
      // width: 1200,
      height: 400,
      // adjustNodePosition: false,
      // isSilentMode: true,
      // overlapMode: 1,
      // hoverOutline: false,
      // nodeSelectedOutline: false,
      multipleSelectKey: 'shift',
      disabledTools: ['multipleSelect'],
      autoExpand: true,
      // metaKeyMultipleSelected: false,
      // adjustEdgeMiddle: true,
      // stopMoveGraph: true,
      adjustEdgeStartAndEnd: true,
      // adjustEdge: false,
      allowRotate: true,
      edgeTextEdit: true,
      keyboard: {
        enabled: true
      },
      partial: true,
      background: {
        color: '#FFFFFF'
      },
      grid: true,
      edgeTextDraggable: true,
      edgeType: 'bezier',
      style: {
        inputText: {
          background: 'black',
          color: 'white'
        }
      },
      idGenerator(type) {
        return type + '_' + Math.random()
      }
    })

    lf.setTheme(customTheme)
    // 注册节点 or 边
    registerElements(lf)
    // 注册自定义 vue 节点
    register(
      {
        type: 'custom-vue-node',
        component: ProgressNode
      },
      lf
    )

    lf.render(data)

    const node1 = lf.addNode({
      id: 'vue-node-1',
      type: 'square',
      x: 80,
      y: 80,
      text: { x: 80, y: 80, value: '节点1' },
      properties: {
        progress: 60,
        width: 80,
        height: 80
      }
    })
    console.log('node1 --->>>', node1)

    const node2 = lf.addNode({
      id: 'vue-node-2',
      type: 'square',
      x: 360,
      y: 80,
      text: { x: 360, y: 80, value: '节点2' },
      properties: {
        progress: 60,
        width: 80,
        height: 80
      }
    })

    const node4 = lf.addNode({
      id: 'vue-node-4',
      type: 'custom-vue-node',
      x: 480,
      y: 80,
      properties: {
        progress: 60,
        width: 80,
        height: 80
      }
    })

    // const node3 = lf.addNode({
    //   id: 'vue-node-1',
    //   type: 'circle',
    //   x: 180,
    //   y: 180,
    //   properties: {
    //     progress: 60,
    //     width: 80,
    //     height: 80
    //   }
    // })
    // setInterval(() => {
    //   const { properties } = node2.getData()
    //   console.log('properties.progress --->>>', properties?.progress)
    //   if (has(properties, 'progress')) {
    //     const progress = properties?.progress
    //     node2.setProperty('progress', (progress + 10) % 100)
    //   }
    // }, 2000)

    lfRef.value = lf
  }
})


</script>
<style>
.logic-wrapper{
  width: 80%;
  height: 80%
}
</style> 