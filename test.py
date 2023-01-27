class Node:
    def __init__(self, indented_line):
        self.children = []
        self.level = len(indented_line) - len(indented_line.lstrip())
        self.text = indented_line.strip()

    def add_children(self, nodes):
        childlevel = nodes[0].level
        while nodes:
            node = nodes.pop(0)
            if node.level == childlevel: # add node as a child
                self.children.append(node)
            elif node.level > childlevel: # add nodes as grandchildren of the last child
                nodes.insert(0,node)
                self.children[-1].add_children(nodes)
            elif node.level <= self.level: # this node is a sibling, no more children
                nodes.insert(0,node)
                return

    def as_dict(self):
        if len(self.children) > 1:
            return {self.text: [node.as_dict() for node in self.children]}
        elif len(self.children) == 1:
            return {self.text: self.children[0].as_dict()}
        else:
            return self.text
indented_text = \
"""
apple
    colours
        red
        yellow
        green
          m
    type
        granny smith
    price
        0.10
"""
root = Node('root')
root.add_children([Node(line) for line in indented_text.splitlines() if line.strip()])
d = root.as_dict()['root']
print(d)