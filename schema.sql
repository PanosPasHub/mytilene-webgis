CREATE TABLE environmentalnoise_reports (
  report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  noise_db_val NUMERIC(5,2) NOT NULL CHECK (noise_db_val > 0),
  noise_source VARCHAR(50) NOT NULL,
  annoyance_level INTEGER CHECK (annoyance_level BETWEEN 1 AND 5),
  rec_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  geom GEOMETRY(Point, 4326)
);

CREATE INDEX idx_noise_geom ON environmentalnoise_reports USING GIST (geom);