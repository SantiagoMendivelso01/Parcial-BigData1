import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackService } from '../../core/services/track.service';
import { CartService } from '../../core/services/cart.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Track, Genre } from '../../shared/models/models';
import { CartComponent } from './cart/cart.component';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule, CartComponent],
  template: `
    <div class="store-layout">
      <!-- Left: Search + Results -->
      <div class="store-main">
        <div class="store-hero">
          <h1 class="hero-title">MUSIC<br>STORE</h1>
          <p class="hero-sub">Stream · Buy · Own</p>
        </div>

        <form class="search-bar" (ngSubmit)="search()">
          <input
            class="search-input"
            type="text"
            placeholder="Search songs, artists, genres..."
            [(ngModel)]="query" name="query"
          />
          <select class="genre-select" [(ngModel)]="selectedGenre" name="genre">
            <option value="">All Genres</option>
            @for (g of genres(); track g.GenreId) {
              <option [value]="g.Name">{{ g.Name }}</option>
            }
          </select>
          <button class="btn-search" type="submit" [disabled]="loading()">
            {{ loading() ? '...' : 'Search' }}
          </button>
        </form>

        <div class="results-header" *ngIf="tracks().length > 0">
          <span>{{ tracks().length }} tracks found</span>
        </div>

        <div class="tracks-list">
          @if (loading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <span>Searching...</span>
            </div>
          } @else if (tracks().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">🎵</span>
              <p>No tracks found. Try a different search.</p>
            </div>
          }

          @for (track of tracks(); track track.TrackId) {
            <div class="track-row" [class.in-cart]="cart.has(track.TrackId)">
              <div class="track-left">
                <div class="track-num">♪</div>
                <div class="track-details">
                  <span class="track-name">{{ track.Name }}</span>
                  <span class="track-meta-line">
                    {{ track.ArtistName || 'Unknown' }} &bull;
                    {{ track.AlbumTitle || '—' }}
                  </span>
                </div>
              </div>
              <div class="track-right">
                <span class="track-genre-pill">{{ track.GenreName || '—' }}</span>
                <span class="track-dur">{{ formatDur(track.Milliseconds) }}</span>
                <span class="track-price">\${{ track.UnitPrice.toFixed(2) }}</span>
                <button
                  class="btn-add-track"
                  [class.added]="cart.has(track.TrackId)"
                  (click)="addToCart(track)"
                >
                  {{ cart.has(track.TrackId) ? '✓' : '+' }}
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Right: Cart -->
      <aside class="store-aside">
        <app-cart />
      </aside>
    </div>
  `
})
export class StoreComponent implements OnInit {
  private trackService = inject(TrackService);
  cart = inject(CartService);
  private toast = inject(ToastService);

  query = '';
  selectedGenre = '';
  tracks = signal<Track[]>([]);
  genres = signal<Genre[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.trackService.getGenres().subscribe(g => this.genres.set(g));
    this.search();
  }

  search() {
    this.loading.set(true);
    this.trackService.search(this.query, this.selectedGenre).subscribe({
      next: res => { this.tracks.set(res); this.loading.set(false); },
      error: err => {
        this.toast.show('Search failed: ' + (err.error?.detail || err.message), 'error');
        this.loading.set(false);
      }
    });
  }

  addToCart(track: Track) {
    const added = this.cart.add(track);
    if (added) this.toast.show(`"${track.Name}" added to cart`, 'success');
    else this.toast.show('Already in cart', 'warning');
  }

  formatDur(ms: number): string {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
