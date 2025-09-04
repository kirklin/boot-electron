/**
 * @internal
 * @en A node in a doubly linked list.
 * @zh 双向链表中的一个节点。
 */
class Node<E> {
  static readonly Undefined = new Node<any>(undefined);

  element: E;
  next: Node<E>;
  prev: Node<E>;

  constructor(element: E) {
    this.element = element;
    this.next = Node.Undefined;
    this.prev = Node.Undefined;
  }
}

/**
 * @en A doubly linked list implementation.
 * @zh 一个双向链表的实现。
 */
export class LinkedList<E> {
  private _first: Node<E> = Node.Undefined;
  private _last: Node<E> = Node.Undefined;
  private _size = 0;

  /**
   * @en The number of elements in the list.
   * @zh 链表中的元素数量。
   */
  get size(): number {
    return this._size;
  }

  /**
   * @en Returns true if the list is empty.
   * @zh 如果链表为空，则返回 true。
   */
  isEmpty(): boolean {
    return this._first === Node.Undefined;
  }

  /**
   * @en Removes all elements from the list.
   * @zh 从链表中移除所有元素。
   */
  clear(): void {
    // Rationale: By breaking the references from the list to the nodes,
    // we allow the garbage collector to reclaim the memory of the nodes.
    // We don't need to iterate and nullify each node's prev/next pointers.
    // @zh 原理：通过断开列表到节点的引用，我们允许垃圾回收器回收节点的内存。
    // 我们不需要遍历并清空每个节点的 prev/next 指针。
    this._first = Node.Undefined;
    this._last = Node.Undefined;
    this._size = 0;
  }

  /**
   * @en Adds an element to the beginning of the list.
   * @zh 在链表开头添加一个元素。
   * @param element The element to add.
   * @returns A function to remove the element from the list.
   */
  unshift(element: E): () => void {
    return this._insert(element, false);
  }

  /**
   * @en Adds an element to the end of the list.
   * @zh 在链表末尾添加一个元素。
   * @param element The element to add.
   * @returns A function to remove the element from the list.
   */
  push(element: E): () => void {
    return this._insert(element, true);
  }

  private _insert(element: E, atTheEnd: boolean): () => void {
    const newNode = new Node(element);
    if (this._first === Node.Undefined) {
      this._first = newNode;
      this._last = newNode;
    } else if (atTheEnd) {
      // push
      const oldLast = this._last;
      this._last = newNode;
      newNode.prev = oldLast;
      oldLast.next = newNode;
    } else {
      // unshift
      const oldFirst = this._first;
      this._first = newNode;
      newNode.next = oldFirst;
      oldFirst.prev = newNode;
    }
    this._size += 1;

    let didRemove = false;
    return () => {
      if (!didRemove) {
        didRemove = true;
        this._remove(newNode);
      }
    };
  }

  /**
   * @en Removes and returns the first element of the list.
   * @zh 移除并返回链表的第一个元素。
   * @returns The first element, or undefined if the list is empty.
   */
  shift(): E | undefined {
    if (this._first === Node.Undefined) {
      return undefined;
    } else {
      const res = this._first.element;
      this._remove(this._first);
      return res;
    }
  }

  /**
   * @en Removes and returns the last element of the list.
   * @zh 移除并返回链表的最后一个元素。
   * @returns The last element, or undefined if the list is empty.
   */
  pop(): E | undefined {
    if (this._last === Node.Undefined) {
      return undefined;
    } else {
      const res = this._last.element;
      this._remove(this._last);
      return res;
    }
  }

  private _remove(node: Node<E>): void {
    // Rationale: This consolidated logic handles all cases:
    // 1. node is the first and last (list becomes empty)
    // 2. node is the first
    // 3. node is the last
    // 4. node is in the middle
    // @zh 原理：这个统一的逻辑处理了所有情况：
    // 1. 节点是第一个也是最后一个（链表变空）
    // 2. 节点是第一个
    // 3. 节点是最后一个
    // 4. 节点在中间
    const { prev, next } = node;
    if (prev !== Node.Undefined) {
      prev.next = next;
    } else {
      this._first = next;
    }

    if (next !== Node.Undefined) {
      next.prev = prev;
    } else {
      this._last = prev;
    }

    this._size -= 1;
  }

  /**
   * @en Allows iterating over the list elements.
   * @zh 允许遍历链表元素。
   */
  * [Symbol.iterator](): Iterator<E> {
    let node = this._first;
    while (node !== Node.Undefined) {
      yield node.element;
      node = node.next;
    }
  }
}
