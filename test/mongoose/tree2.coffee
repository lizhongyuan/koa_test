
testTree = {
  sub: [
    {
      code: 0,
      sub: [
        {
          code: '1',
          sub: [
            {
              code: 'a',
              sub: null
            },
            {
              sub: [
                {
                  code: 'c',
                  sub: null
                }
              ]
            }
          ]
        },
        {
          code: 'b',
          sub: null
        }
      ]
    }
  ]
}


traverse = (node, costCenterArr)->
  if node.sub is null and node.code isnt undefined
    costCenterArr.push(node.code)
    return

  for subNode in node.sub
    traverse(subNode, costCenterArr)


getLeafCostCenterArr = (node)->
  costCenterArr = []
  traverse(node, costCenterArr)
  return costCenterArr


leafCostCenterArr = getLeafCostCenterArr(testTree)

console.log leafCostCenterArr
