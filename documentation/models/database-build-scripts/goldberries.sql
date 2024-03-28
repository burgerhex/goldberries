-- Combined Build Script

-- =========== Drop Statements ===========
DROP TABLE fwg_data;
DROP TABLE change;
DROP TABLE submission;
DROP TABLE challenge;
DROP TABLE "map";
DROP TABLE account;
DROP TABLE player;
DROP TABLE logging;
DROP TABLE new_challenge;
DROP TABLE difficulty;
DROP TABLE objective;
DROP TABLE campaign;



-- =========== Create Statements ===========

-- ====== campaign ======
CREATE TABLE campaign
(
 "id"                       integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 name                     varchar(128) NOT NULL,
 url                      text NOT NULL,
 date_added               timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
 icon_url                 text NULL,
 sort_major_name          varchar(32) NULL,
 sort_major_labels        text NULL,
 sort_major_colors text NULL,
 sort_minor_name          varchar(32) NULL,
 sort_minor_labels        text NULL,
 sort_minor_colors text NULL,
 author_gb_id             integer NULL,
 author_gb_name           varchar(128) NULL,
 CONSTRAINT campaign_pkey PRIMARY KEY ( "id" )
);

-- ====== objective ======
CREATE TABLE objective
(
 "id"                  integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 name                varchar(64) NOT NULL,
 description         text NOT NULL,
 display_name_suffix varchar(32) NULL,
 is_arbitrary        boolean NOT NULL DEFAULT false,
 CONSTRAINT objective_pkey PRIMARY KEY ( "id" )
);

-- ====== difficulty ======
CREATE TABLE difficulty
(
 "id"      integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 name    varchar(32) NOT NULL,
 subtier text NULL,
 sort    integer NOT NULL,
 CONSTRAINT difficulty_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT check_difficulty_subtier CHECK ( subtier in ('high', 'mid', 'low', 'guard') )
);

-- ====== new_challenge ======
CREATE TABLE new_challenge
(
 "id"          integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 url         text NOT NULL,
 name        varchar(128) NULL,
 description text NULL,
 CONSTRAINT newchallenge_pkey PRIMARY KEY ( "id" )
);

-- ====== logging ======
CREATE TABLE logging
(
 "id"      integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 message text NOT NULL,
 level   text NOT NULL,
 topic   varchar(64) NULL,
 "date"    timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT logging_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT check_logging_level CHECK ( level in ('debug', 'info', 'warn', 'error', 'critical') )
);

-- ====== player ======
CREATE TABLE player
(
 "id"   integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 name varchar(32) NOT NULL,
 CONSTRAINT player_pkey PRIMARY KEY ( "id" )
);

-- ====== account ======
CREATE TABLE account
(
 "id"               integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 player_id          integer NULL,
 claimed_player_id  integer NULL,
 email              varchar(64) NULL,
 password           varchar(128) NULL,
 discord_id         varchar(32) NULL,
 session_token      varchar(64) NULL,
 session_created    timestamptz NULL,
 date_created       timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 is_verifier        boolean NOT NULL DEFAULT false,
 is_admin           boolean NOT NULL DEFAULT false,
 is_suspended       boolean NOT NULL DEFAULT false,
 suspension_reason  text NULL,
 email_verified     boolean NOT NULL DEFAULT false,
 email_verify_code  varchar(16) NULL,
 links              text NULL,
 input_method       text NULL,
 about_me           text NULL,
 name_color_start   text NULL,
 name_color_end     text NULL,
 last_player_rename timestamptz NULL,
 CONSTRAINT account_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT account_claimed_player_id_fkey FOREIGN KEY ( claimed_player_id ) REFERENCES player ( "id" ) ON DELETE SET NULL ON UPDATE CASCADE,
 CONSTRAINT account_player_id_fkey FOREIGN KEY ( player_id ) REFERENCES player ( "id" ) ON DELETE SET NULL ON UPDATE CASCADE,
 CONSTRAINT check_account_input_method CHECK ( input_method IS NULL OR input_method IN ('keyboard', 'controller', 'hybrid', 'other') )
);

-- ====== map ======
CREATE TABLE "map"
(
 "id"               integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 campaign_id      integer NOT NULL,
 name             varchar(128) NOT NULL,
 url              text NULL,
 date_added       timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
 has_fc           boolean NOT NULL DEFAULT false,
 is_rejected      boolean NOT NULL DEFAULT false,
 rejection_reason text NULL,
 is_archived      boolean NOT NULL DEFAULT false,
 sort_major       integer NULL,
 sort_minor       integer NULL,
 sort_order       integer NULL,
 author_gb_id     integer NULL,
 author_gb_name   varchar(128) NULL,
 CONSTRAINT map_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT map_campaign_id_fkey FOREIGN KEY ( campaign_id ) REFERENCES campaign ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ====== challenge ======
CREATE TABLE challenge
(
 "id"            integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 campaign_id   integer NULL,
 map_id        integer NULL,
 objective_id  integer NOT NULL,
 description   text NULL,
 difficulty_id integer NOT NULL,
 date_created  timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
 requires_fc   boolean NOT NULL DEFAULT false,
 has_fc        boolean NOT NULL DEFAULT false,
 is_arbitrary  boolean NULL,
 CONSTRAINT challenge_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT challenge_campaign_id_fkey FOREIGN KEY ( campaign_id ) REFERENCES campaign ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT challenge_difficulty_id_fkey FOREIGN KEY ( difficulty_id ) REFERENCES difficulty ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT challenge_map_id_fkey FOREIGN KEY ( map_id ) REFERENCES "map" ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT challenge_objective_id_fkey FOREIGN KEY ( objective_id ) REFERENCES objective ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT check_challenge_fc CHECK ( has_fc = false OR requires_fc = false )
);

-- ====== submission ======
CREATE TABLE submission
(
 "id"                      integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 challenge_id            integer NULL,
 player_id               integer NOT NULL,
 date_created            timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
 is_fc                   boolean NOT NULL DEFAULT false,
 proof_url               text NOT NULL,
 raw_session_url         text NULL,
 player_notes            text NULL,
 suggested_difficulty_id integer NULL,
 is_verified             boolean NOT NULL DEFAULT false,
 is_rejected             boolean NOT NULL DEFAULT false,
 date_verified           timestamptz NULL,
 verifier_notes          text NULL,
 verifier_id             integer NULL,
 new_challenge_id        integer NULL,
 CONSTRAINT submission_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT submission_challenge_id_fkey FOREIGN KEY ( challenge_id ) REFERENCES challenge ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT submission_new_challenge_id_fkey FOREIGN KEY ( new_challenge_id ) REFERENCES new_challenge ( "id" ) ON DELETE SET NULL ON UPDATE CASCADE,
 CONSTRAINT submission_player_id_fkey FOREIGN KEY ( player_id ) REFERENCES player ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT submission_suggested_difficulty_id_fkey FOREIGN KEY ( suggested_difficulty_id ) REFERENCES difficulty ( "id" ) ON DELETE SET NULL ON UPDATE CASCADE,
 CONSTRAINT submission_verifier_id_fkey FOREIGN KEY ( verifier_id ) REFERENCES player ( "id" ) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ====== change ======
CREATE TABLE change
(
 "id"           integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 campaign_id  integer NULL,
 map_id       integer NULL,
 challenge_id integer NULL,
 player_id    integer NULL,
 author_id    integer NULL,
 description  text NOT NULL,
 "date"         timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT change_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT change_author_id_fkey FOREIGN KEY ( author_id ) REFERENCES player ( "id" ) ON DELETE SET NULL ON UPDATE CASCADE,
 CONSTRAINT change_campaign_id_fkey FOREIGN KEY ( campaign_id ) REFERENCES campaign ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT change_challenge_id_fkey FOREIGN KEY ( challenge_id ) REFERENCES challenge ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT change_map_id_fkey FOREIGN KEY ( map_id ) REFERENCES "map" ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT change_player_id_fkey FOREIGN KEY ( player_id ) REFERENCES player ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ====== fwg_data ======
CREATE TABLE fwg_data
(
 "id"                       integer NOT NULL GENERATED BY DEFAULT AS IDENTITY,
 submission_id            integer NOT NULL,
 date_achieved            timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 platform                 varchar(32) NOT NULL,
 moonberry                boolean NOT NULL DEFAULT false,
 used_keys                boolean NOT NULL DEFAULT false,
 kept_keys                integer NOT NULL DEFAULT 0,
 repeat_collect           boolean NOT NULL DEFAULT false,
 partial_run              boolean NOT NULL DEFAULT false,
 berry_number             integer NOT NULL DEFAULT 202,
 date_202                 timestamptz NULL,
 attempted_double_collect boolean NOT NULL DEFAULT false,
 double_collect           boolean NOT NULL DEFAULT false,
 no_moonberry_pickup      boolean NOT NULL DEFAULT false,
 CONSTRAINT farewellgoldendata_pkey PRIMARY KEY ( "id" ),
 CONSTRAINT farewellgoldendata_submission_id_fkey FOREIGN KEY ( submission_id ) REFERENCES submission ( "id" ) ON DELETE CASCADE ON UPDATE CASCADE
);



-- =========== VIEWS ===========
CREATE VIEW "view_submissions" AS SELECT                                                                   
  campaign.id AS campaign_id,                                            
  campaign.name AS campaign_name,                                        
  campaign.url AS campaign_url,                                          
  campaign.date_added AS campaign_date_added,                            
  campaign.icon_url AS campaign_icon_url,                                
  campaign.sort_major_name AS campaign_sort_major_name,                  
  campaign.sort_major_labels AS campaign_sort_major_labels,              
  campaign.sort_major_colors AS campaign_sort_major_colors,
  campaign.sort_minor_name AS campaign_sort_minor_name,                  
  campaign.sort_minor_labels AS campaign_sort_minor_labels,              
  campaign.sort_minor_colors AS campaign_sort_minor_colors,
  campaign.author_gb_id AS campaign_author_gb_id,                        
  campaign.author_gb_name AS campaign_author_gb_name,                    
                                                                         
  map.id AS map_id,                                                      
  map.campaign_id AS map_campaign_id,                                    
  map.name AS map_name,                                                  
  map.url AS map_url,                                                    
  map.date_added AS map_date_added,                                      
  map.is_rejected AS map_is_rejected,                                    
  map.rejection_reason AS map_rejection_reason,
  map.is_archived AS map_is_archived,
  map.has_fc AS map_has_fc,
  map.sort_major AS map_sort_major,
  map.sort_minor AS map_sort_minor,
  map.sort_order AS map_sort_order,
  map.author_gb_id AS map_author_gb_id,
  map.author_gb_name AS map_author_gb_name,

  challenge.id AS challenge_id,
  challenge.campaign_id AS challenge_campaign_id,
  challenge.map_id AS challenge_map_id,
  challenge.objective_id AS challenge_objective_id,
  challenge.description AS challenge_description,
  challenge.difficulty_id AS challenge_difficulty_id,
  challenge.date_created AS challenge_date_created,
  challenge.requires_fc AS challenge_requires_fc,
  challenge.has_fc AS challenge_has_fc,
  challenge.is_arbitrary AS challenge_is_arbitrary,

  cd.id AS difficulty_id,
  cd.name AS difficulty_name,
  cd.subtier AS difficulty_subtier,
  cd.sort AS difficulty_sort,

  objective.id AS objective_id,
  objective.name AS objective_name,
  objective.description AS objective_description,
  objective.display_name_suffix AS objective_display_name_suffix,
  objective.is_arbitrary AS objective_is_arbitrary,

  submission.id AS submission_id,
  submission.challenge_id AS submission_challenge_id,
  submission.player_id AS submission_player_id,
  submission.date_created AS submission_date_created,
  submission.is_fc AS submission_is_fc,
  submission.proof_url AS submission_proof_url,
  submission.raw_session_url AS submission_raw_session_url,
  submission.player_notes AS submission_player_notes,
  submission.suggested_difficulty_id AS submission_suggested_difficulty_id,
  submission.is_verified AS submission_is_verified,
  submission.is_rejected AS submission_is_rejected,
  submission.date_verified AS submission_date_verified,
  submission.verifier_notes AS submission_verifier_notes,
  submission.verifier_id AS submission_verifier_id,
  submission.new_challenge_id AS submission_new_challenge_id,

  p.id AS player_id,
  p.name AS player_name,

  v.id AS verifier_id,
  v.name AS verifier_name,

  pd.id AS suggested_difficulty_id,
  pd.name AS suggested_difficulty_name,
  pd.subtier AS suggested_difficulty_subtier,
  pd.sort AS suggested_difficulty_sort

FROM campaign
JOIN map  ON campaign.id = map.campaign_id
JOIN challenge  ON map.id = challenge.map_id
JOIN difficulty cd ON challenge.difficulty_id = cd.id
JOIN objective  ON challenge.objective_id = objective.id
JOIN submission  ON challenge.id = submission.challenge_id
JOIN player p ON p.id = submission.player_id
LEFT JOIN player v ON v.id = submission.verifier_id
LEFT JOIN difficulty pd ON submission.suggested_difficulty_id = pd.id

ORDER BY campaign.name, campaign.id, map.sort_major, map.sort_minor, map.sort_order, map.name, cd.sort DESC, submission.id ;



CREATE VIEW "view_challenges" AS SELECT                                                                   
  campaign.id AS campaign_id,                                            
  campaign.name AS campaign_name,                                        
  campaign.url AS campaign_url,                                          
  campaign.date_added AS campaign_date_added,                            
  campaign.icon_url AS campaign_icon_url,                                
  campaign.sort_major_name AS campaign_sort_major_name,                  
  campaign.sort_major_labels AS campaign_sort_major_labels,              
  campaign.sort_major_colors AS campaign_sort_major_colors,
  campaign.sort_minor_name AS campaign_sort_minor_name,                  
  campaign.sort_minor_labels AS campaign_sort_minor_labels,              
  campaign.sort_minor_colors AS campaign_sort_minor_colors,
  campaign.author_gb_id AS campaign_author_gb_id,                        
  campaign.author_gb_name AS campaign_author_gb_name,                    
                                                                         
  map.id AS map_id,                                                      
  map.campaign_id AS map_campaign_id,                                    
  map.name AS map_name,                                                  
  map.url AS map_url,                                                    
  map.date_added AS map_date_added,                                      
  map.is_rejected AS map_is_rejected,                                    
  map.rejection_reason AS map_rejection_reason,
  map.is_archived AS map_is_archived,
  map.has_fc AS map_has_fc,
  map.sort_major AS map_sort_major,
  map.sort_minor AS map_sort_minor,
  map.sort_order AS map_sort_order,
  map.author_gb_id AS map_author_gb_id,
  map.author_gb_name AS map_author_gb_name,

  challenge.id AS challenge_id,
  challenge.campaign_id AS challenge_campaign_id,
  challenge.map_id AS challenge_map_id,
  challenge.objective_id AS challenge_objective_id,
  challenge.description AS challenge_description,
  challenge.difficulty_id AS challenge_difficulty_id,
  challenge.date_created AS challenge_date_created,
  challenge.requires_fc AS challenge_requires_fc,
  challenge.has_fc AS challenge_has_fc,
  challenge.is_arbitrary AS challenge_is_arbitrary,

  cd.id AS difficulty_id,
  cd.name AS difficulty_name,
  cd.subtier AS difficulty_subtier,
  cd.sort AS difficulty_sort,

  objective.id AS objective_id,
  objective.name AS objective_name,
  objective.description AS objective_description,
  objective.display_name_suffix AS objective_display_name_suffix,
  objective.is_arbitrary AS objective_is_arbitrary,

  COUNT(submission.id) AS count_submissions

FROM campaign
JOIN map  ON campaign.id = map.campaign_id
JOIN challenge  ON map.id = challenge.map_id
JOIN difficulty cd ON challenge.difficulty_id = cd.id
JOIN objective  ON challenge.objective_id = objective.id
LEFT JOIN submission  ON challenge.id = submission.challenge_id

GROUP BY campaign.id, map.id, challenge.id, cd.id, objective.id
ORDER BY campaign.name, campaign.id, map.sort_major, map.sort_minor, map.sort_order, map.name, cd.sort DESC ;