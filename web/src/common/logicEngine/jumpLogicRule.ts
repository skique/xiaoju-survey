

/** 方案1：条件和目标都是多选
 {
  conditions: [
    {
      field: 'data515', // 题目2
      operator: 'in',
      value: ['115019']
    }
  ],
  actions:[
    {
      scope: 'question',
      target: 'data648' // 题目3
    }
  ]
}
*/


/** 方案2：条件和目标都是单选
 {
  conditions: {
    field: 'data515', // 题目2
    operator: 'in',
    value: ['115019']
  },
  scope: 'question',
  target: 'data648' // 题目3
}
*/


/** 方案3：保持现状：条件多选，目标单选
{
  conditions: [
    {
      field: 'data515', // 题目2
      operator: 'in',
      value: ['115019']
    }
  ],
  scope: 'question',
  target: 'data648' // 题目3
}
*/


/** 逻辑规则聚合
 const rules: Rule[] = [
  {
    "conditions": [{ "field": "Q1", "operator": "answered", "value": true }],
    "logic": "AND",
    "actions": [
      { "type": "SHOW", "target": "Q3" },
      { "type": "HIDE", "target": "Q2" }
    ]
  }
];
*/

export const jumpLogicRule = [
  {
    conditions: [
        {
            "field": "data423",  // 题目1答完，相当于不等于空
            "operator": "in",
            "value": '110402'
        },
    ],
    type: 'jump',
    scope: 'question',
    target: "data893", 
  },
  {
      conditions: [
          {
              "field": "data577",  // 题目3答完，相当于不等于空
              "operator": "neq",
              "value": ''
          },
      ],
      scope: 'question',
      target: "data893", 
  },
  {
      conditions: [
          {
              "field": "data423",  // 题目1答完，相当于不等于空
              "operator": "in",
              "value": '115019'
          },
      ],
      action: 'jump',
      scope: 'question',
      target: "data684", 
  },
  {
      conditions: [
          {
              "field": "data423",  // 题目1答完，相当于不等于空
              "operator": "in",
              "value": '115020'
          },
      ],
      action: 'jump',
      scope: 'question',
      target: "data243", 
  },
]


// export const jumpLogicRule1 = [
//   [{
//     condition: {
//       "field": "data423",  // 题目1答完，相当于不等于空
//       "operator": "in",
//       "value": '1'
//     },
//     target: 'q6',
//   },
//   {
//     condition: {
//       "field": "data423",  // 题目1答完，相当于不等于空
//       "operator": "in",
//       "value": '2'
//     },
//     target: 'q7',
//   }]
// ]
