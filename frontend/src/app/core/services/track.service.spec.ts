import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TrackService } from './track.service';

describe('TrackService', () => {
  let service: TrackService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TrackService]
    });
    service = TestBed.inject(TrackService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call search endpoint with query param', () => {
    service.search('rock').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/tracks/search') && r.params.get('q') === 'rock');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call search with genre param', () => {
    service.search('', 'Rock').subscribe();
    const req = httpMock.expectOne(r => r.params.get('genre') === 'Rock');
    req.flush([]);
  });

  it('should call genres endpoint', () => {
    service.getGenres().subscribe(genres => expect(genres.length).toBe(2));
    const req = httpMock.expectOne(r => r.url.includes('/api/tracks/genres'));
    req.flush([{ GenreId: 1, Name: 'Rock' }, { GenreId: 2, Name: 'Jazz' }]);
  });
});
