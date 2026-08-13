/**
 * treeHelpers.ts
 * ─────────────────────────────────────────────────────────────
 * Pure utility functions for traversing and mutating the CanvasNode tree.
 *
 * WHY a separate file?
 *   useBuilderStore.ts was growing large. These helpers are pure functions
 *   with no Zustand dependency — keeping them here makes them easy to test
 *   and reason about independently.
 *
 * All functions are immutable: they return new tree objects instead of
 * mutating the originals. This is required for Zustand's state model.
 * ─────────────────────────────────────────────────────────────
 */

import type { CanvasNode, ComponentType } from "../types/builder";

// ── Exported so the store can stamp new unique IDs ─────────────────────────
export const generateId = () =>
  `node_${Math.random().toString(36).slice(2, 9)}`;

// ─── Tree Search ───────────────────────────────────────────────────────────

/** Find a single node anywhere in the tree. Returns null if not found. */
export const findNode = (node: CanvasNode, id: string): CanvasNode | null => {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
};

/** Find the direct parent of a node identified by childId. */
export const findParent = (
  node: CanvasNode,
  childId: string,
): CanvasNode | null => {
  if (!node.children) return null;
  for (const child of node.children) {
    if (child.id === childId) return node;
    const parent = findParent(child, childId);
    if (parent) return parent;
  }
  return null;
};

/**
 * Collect the full ancestor chain from root down to the target node
 * (inclusive). Used by the breadcrumb bar in Canvas.tsx.
 */
export const findAncestors = (
  root: CanvasNode,
  targetId: string,
  path: { id: string; name: string; type: ComponentType }[] = [],
): { id: string; name: string; type: ComponentType }[] | null => {
  const currentPath = [
    ...path,
    { id: root.id, name: root.name, type: root.type },
  ];
  if (root.id === targetId) return currentPath;
  if (root.children) {
    for (const child of root.children) {
      const res = findAncestors(child, targetId, currentPath);
      if (res) return res;
    }
  }
  return null;
};

// ─── Tree Mutation (immutable) ─────────────────────────────────────────────

/** Apply an updater function to one node while leaving the rest untouched. */
export const updateNodeInTree = (
  node: CanvasNode,
  id: string,
  updater: (target: CanvasNode) => CanvasNode,
): CanvasNode => {
  if (node.id === id) return updater(node);
  if (node.children) {
    return {
      ...node,
      children: node.children.map((child) =>
        updateNodeInTree(child, id, updater),
      ),
    };
  }
  return node;
};

/** Remove a node from the tree by id, returning the updated tree. */
export const removeNodeFromTree = (
  node: CanvasNode,
  id: string,
): CanvasNode => {
  if (node.children) {
    return {
      ...node,
      children: node.children
        .filter((child) => child.id !== id)
        .map((child) => removeNodeFromTree(child, id)),
    };
  }
  return node;
};

/** Deep-clone a subtree with fresh IDs for all nodes (used by duplicateNode). */
export const deepCloneNodeWithNewIds = (node: CanvasNode): CanvasNode => ({
  ...node,
  id: generateId(),
  name: `${node.name} (Copy)`,
  children: node.children
    ? node.children.map(deepCloneNodeWithNewIds)
    : undefined,
});

/** Insert a new node as a child of parentId. Optional targetIndex controls position. */
export const insertNodeInTree = (
  root: CanvasNode,
  parentId: string,
  newNode: CanvasNode,
  targetIndex?: number,
): CanvasNode => {
  return updateNodeInTree(root, parentId, (parent) => {
    const children = parent.children ? [...parent.children] : [];
    if (
      targetIndex !== undefined &&
      targetIndex >= 0 &&
      targetIndex <= children.length
    ) {
      children.splice(targetIndex, 0, newNode);
    } else {
      children.push(newNode);
    }
    return { ...parent, isContainer: true, children };
  });
};

/**
 * Move an existing node (activeId) to a new position relative to targetId.
 *   'before'  → sibling immediately before target
 *   'after'   → sibling immediately after target
 *   'inside'  → first child of target (must be a container)
 */
export const moveNodeInTree = (
  root: CanvasNode,
  activeId: string,
  targetId: string,
  position: "before" | "after" | "inside",
): CanvasNode => {
  if (activeId === targetId || activeId === root.id) return root;

  const nodeToMove = findNode(root, activeId);
  if (!nodeToMove) return root;

  const treeWithoutActive = removeNodeFromTree(root, activeId);

  if (position === "inside") {
    const targetNode = findNode(treeWithoutActive, targetId);
    if (!targetNode) return root;

    if (!targetNode.isContainer) {
      // Target is not a container → place after it instead
      const parent = findParent(treeWithoutActive, targetId);
      if (!parent || !parent.children) return root;
      const idx = parent.children.findIndex((c) => c.id === targetId);
      return insertNodeInTree(
        treeWithoutActive,
        parent.id,
        nodeToMove,
        idx + 1,
      );
    }

    return insertNodeInTree(treeWithoutActive, targetId, nodeToMove);
  }

  const targetParent = findParent(treeWithoutActive, targetId);
  if (!targetParent || !targetParent.children) return root;

  const targetIdx = targetParent.children.findIndex((c) => c.id === targetId);
  const insertIdx = position === "before" ? targetIdx : targetIdx + 1;

  return insertNodeInTree(
    treeWithoutActive,
    targetParent.id,
    nodeToMove,
    insertIdx,
  );
};
