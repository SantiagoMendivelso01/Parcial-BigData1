import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Track } from '../../shared/models/models';

const mockTrack: Track = {
  TrackId: 1, Name: 'Bohemian Rhapsody', UnitPrice: 0.99,
  Milliseconds: 354000, ArtistName: 'Queen', GenreName: 'Rock',
  AlbumTitle: 'A Night at the Opera'
};

const mockTrack2: Track = {
  TrackId: 2, Name: 'Stairway to Heaven', UnitPrice: 1.29,
  Milliseconds: 482000, ArtistName: 'Led Zeppelin', GenreName: 'Rock',
  AlbumTitle: 'Led Zeppelin IV'
};

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [CartService] });
    service = TestBed.inject(CartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start empty', () => {
    expect(service.count()).toBe(0);
    expect(service.total()).toBe(0);
    expect(service.items().length).toBe(0);
  });

  it('should add a track successfully', () => {
    const added = service.add(mockTrack);
    expect(added).toBeTrue();
    expect(service.count()).toBe(1);
    expect(service.has(mockTrack.TrackId)).toBeTrue();
  });

  it('should not add duplicate track', () => {
    service.add(mockTrack);
    const addedAgain = service.add(mockTrack);
    expect(addedAgain).toBeFalse();
    expect(service.count()).toBe(1);
  });

  it('should calculate total correctly', () => {
    service.add(mockTrack);
    service.add(mockTrack2);
    expect(service.total()).toBeCloseTo(0.99 + 1.29, 2);
  });

  it('should remove a track', () => {
    service.add(mockTrack);
    service.remove(mockTrack.TrackId);
    expect(service.count()).toBe(0);
    expect(service.has(mockTrack.TrackId)).toBeFalse();
  });

  it('should clear all items', () => {
    service.add(mockTrack);
    service.add(mockTrack2);
    service.clear();
    expect(service.count()).toBe(0);
    expect(service.total()).toBe(0);
  });

  it('should return false for has() when track not in cart', () => {
    expect(service.has(999)).toBeFalse();
  });
});
