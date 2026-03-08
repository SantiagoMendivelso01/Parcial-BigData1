import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Track } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);
  readonly total = computed(() =>
    this._items().reduce((sum, i) => sum + i.UnitPrice * i.qty, 0)
  );

  add(track: Track): boolean {
    if (this._items().find(i => i.TrackId === track.TrackId)) return false;
    this._items.update(items => [...items, { ...track, qty: 1 }]);
    return true;
  }

  remove(trackId: number) {
    this._items.update(items => items.filter(i => i.TrackId !== trackId));
  }

  clear() {
    this._items.set([]);
  }

  has(trackId: number): boolean {
    return !!this._items().find(i => i.TrackId === trackId);
  }
}
