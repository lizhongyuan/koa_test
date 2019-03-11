
tree = exports? and exports or @tree = {}

class tree.Tree
  constructor : (node, children)->
    @node = node
    @children = children

  @build : (list)->
    return new tree(null, []) if not list
    root = null
    list.some (item)->
      if item.pid == null
        root = {node: item, children: []}
        true
      else
        false
    return new tree.Tree(null, []) if not root


    process = (node)->
      list.forEach (item)->
        if item.pid != null
          if item.pid.toString() == node.node._id.toString()
            tmp = {node: item, children:[]}
            node.children.push tmp
      node.children.forEach (item)->
        process(item)
      node

    process root


  @getCurTree : (curTreeRid, curTree)->
    if curTreeRid == null
      return curTree
    if curTree == null
      return null
    doget = (curtree)->
      tree = null
      if curtree.node == null
        false
      else
        if curtree.node._id.toString() == curTreeRid
          tree = curtree
          tree
        else
          curtree.children.some (child)->
            if child.node != null
              tree = doget child
              tree
        tree
    doget curTree


module.exports.getChild = (nid, list, selfContained)->
  if nid == null or nid == undefined  or nid == ""
    return list
  result = []
  contained = true
  contained = selfContained if selfContained
  if contained
    list.some (n)->
      if n._id.toString() == nid
        result.push n
        true
  pushChild = (pid) ->
    list.forEach (n) ->
      if n.pid == pid
        result.push n
        pushChild n._id.toString()
  pushChild nid
  result


module.exports.getParent = (nid, list, self)->
  result = []
  pid = ""
  list.some (n) ->
    if n._id.toString() == nid
      if self
        result.push n
      pid = n.pid
      return true

  pushParent = (pid) ->
    list.forEach (n) ->
      if n._id.toString() == pid
        result.push n
        if n.pid != null
          pushParent n.pid
  pushParent pid
  result.reverse()


