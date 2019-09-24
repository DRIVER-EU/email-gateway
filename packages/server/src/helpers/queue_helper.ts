export class Queue<T> {
    _queue: T[];

    constructor(queue?: T[]) {
      this._queue = queue || [];
   }

   enqueue(item: T) {
     this._queue.push(item);
   }

   dequeue(): T | undefined {
     return (this._queue) ? this._queue.shift() : undefined;
   }

   clear() {
     this._queue = [];
   }

   get count(): number {
     return this._queue.length;
   }
}