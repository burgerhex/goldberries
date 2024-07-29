import { Link, useNavigate, useParams } from "react-router-dom";
import { getQueryData, useGetCampaignView, useGetCampaignViewPlayer } from "../hooks/useApi";
import {
  BasicBox,
  BasicContainerBox,
  BorderedBox,
  ErrorDisplay,
  HeadTitle,
  InfoBox,
  InfoBoxIconTextLine,
  LoadingSpinner,
  StyledExternalLink,
  StyledLink,
} from "../components/BasicComponents";
import {
  Box,
  Button,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { TopGoldenList } from "../components/TopGoldenList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faCheckCircle,
  faExternalLink,
  faListDots,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import "../css/Campaign.css";
import { useEffect, useState } from "react";
import { getCampaignName, getChallengeNameShort, getMapLobbyInfo, getMapName } from "../util/data_util";
import { getNewDifficultyColors } from "../util/constants";
import { Changelog } from "../components/Changelog";
import {
  CampaignIcon,
  ChallengeFcIcon,
  DifficultyChip,
  GamebananaEmbed,
  PlayerLink,
  SubmissionFcIcon,
} from "../components/GoldberriesComponents";
import { useTheme } from "@emotion/react";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "@uidotdev/usehooks";
import { SubmissionFilter, getDefaultFilter } from "../components/SubmissionFilter";

const STYLE_CONSTS = {
  player: {
    width: 150,
    height: 70,
  },
  submission: {
    height: 50,
  },
  map: {
    width: 250,
    borderLeft: 25,
    counter: 150,
  },
  total: {
    height: 70,
  },
  lobby: {
    width: 120,
    fontSize: 75,
  },
};

export function PageCampaign() {
  const { id, tab } = useParams();
  const navigate = useNavigate();

  const setTab = (newTab) => {
    if (newTab === "players") {
      navigate(`/campaign/${id}`, { replace: true });
    } else {
      navigate(`/campaign/${id}/${newTab}`, { replace: true });
    }
  };

  if (tab === "top-golden-list") {
    return <PageCampaignTopGoldenList id={id} />;
  }

  return (
    <BasicContainerBox maxWidth="md">
      <CampaignDisplay id={parseInt(id)} tab={tab ?? "players"} setTab={setTab} />
    </BasicContainerBox>
  );
}

export function CampaignDisplay({ id, tab, setTab = () => {} }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const query = useGetCampaignView(id);

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const response = getQueryData(query);
  const { campaign, players } = response;
  const title = getCampaignName(campaign, t_g);
  const hasFullGameChallenges = campaign.challenges.length > 0;

  return (
    <>
      <HeadTitle title={title} />
      <Stack direction="row" alignItems="center" gap={1}>
        {campaign.icon_url === null && <FontAwesomeIcon icon={faBook} size="2x" />}
        <CampaignIcon campaign={campaign} height="1.7em" />
        <Typography variant="h4">{campaign.name}</Typography>
      </Stack>

      <Stack direction="row" alignItems="center" gap={1} justifyContent="space-around" sx={{ mt: 1 }}>
        <GamebananaEmbed campaign={campaign} size="large" />
      </Stack>

      <CampaignDetailsList campaign={campaign} sx={{ mt: 0 }} />

      <Divider sx={{ mt: 2 }} />

      <Tabs variant="fullWidth" value={tab} onChange={(event, newTab) => setTab(newTab)} sx={{ mt: 0 }}>
        <Tab label={t_g("player", { count: 30 })} value="players" />
        <Tab label={t_g("map", { count: 30 })} value="maps" />
        {hasFullGameChallenges && <Tab label={t_g("challenge", { count: 30 })} value="challenges" />}
      </Tabs>
      <Divider sx={{ my: 0 }} />

      {tab === "players" && <CampaignPlayerTable campaign={campaign} players={players} sx={{ mt: 2 }} />}
      {tab === "maps" && <CampaignMapList campaign={campaign} sx={{ mt: 2 }}></CampaignMapList>}
      {tab === "challenges" && (
        <CampaignChallengeList campaign={campaign} sx={{ mt: 2 }}></CampaignChallengeList>
      )}

      <Divider sx={{ my: 2 }} />
      <Changelog type="campaign" id={id} />
    </>
  );
}

//#region Campaign Info

export function CampaignDetailsList({ campaign, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "campaign.info_boxes" });
  const { t: t_c } = useTranslation(undefined, { keyPrefix: "challenge" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });

  const hasMajorSort = campaign.sort_major_name !== null;
  const hasMinorSort = campaign.sort_minor_name !== null;

  const validMaps = campaign.maps.filter((map) => !map.is_archived && !map.is_rejected);
  const rejectedMapsCount = campaign.maps.filter((map) => map.is_rejected).length;
  const archivedMapsCount = campaign.maps.filter((map) => map.is_archived).length;
  const mapsCountStr =
    archivedMapsCount > 0
      ? t("maps_archived", { count: validMaps.length, archived: archivedMapsCount })
      : t("maps", { count: validMaps.length });

  return (
    <Grid container columnSpacing={1} rowSpacing={1} {...props}>
      <Grid item xs={12} sm={6} display="flex" flexDirection="column" rowGap={1}>
        <InfoBox>
          <InfoBoxIconTextLine
            icon={<FontAwesomeIcon icon={faBook} />}
            text={t_g("campaign", { count: 1 })}
          />
          <InfoBoxIconTextLine text={campaign.name} isSecondary />
        </InfoBox>
        <InfoBox>
          <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faListDots} />} text={t("map_count")} />
          <InfoBoxIconTextLine text={mapsCountStr} isSecondary />
          {rejectedMapsCount > 0 && (
            <InfoBoxIconTextLine text={t("maps_rejected", { count: rejectedMapsCount })} isSecondary />
          )}
        </InfoBox>
        {(hasMajorSort || hasMinorSort) && (
          <InfoBox>
            {hasMajorSort && (
              <>
                <InfoBoxIconTextLine text={campaign.sort_major_name} />
                <SortInfoBoxLine labels={campaign.sort_major_labels} colors={campaign.sort_major_colors} />
              </>
            )}
            {hasMinorSort && (
              <>
                <InfoBoxIconTextLine text={campaign.sort_minor_name} />
                <SortInfoBoxLine labels={campaign.sort_minor_labels} colors={campaign.sort_minor_colors} />
              </>
            )}
          </InfoBox>
        )}
      </Grid>
      <Grid item xs={12} sm={6} display="flex" flexDirection="column" rowGap={1}>
        <InfoBox>
          <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faUser} />} text={t("author")} />
          <InfoBoxIconTextLine
            text={
              <StyledExternalLink href={"https://gamebanana.com/members/" + campaign.author_gb_id}>
                {campaign.author_gb_name}
              </StyledExternalLink>
            }
            isSecondary
          />
        </InfoBox>
        <InfoBox>
          <InfoBoxIconTextLine icon={<FontAwesomeIcon icon={faExternalLink} />} text={t("links")} />
          <InfoBoxIconTextLine
            text={<StyledExternalLink href={campaign.url}>{campaign.url}</StyledExternalLink>}
            isSecondary
          />
          <InfoBoxIconTextLine />
          <InfoBoxIconTextLine
            text={
              <StyledLink to={"/campaign/" + campaign.id + "/top-golden-list"}>
                {t("campaign_tgl")}
              </StyledLink>
            }
            isSecondary
          />
        </InfoBox>
      </Grid>
    </Grid>
  );
}
function SortInfoBoxLine({ labels, colors }) {
  const textShadow =
    "black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px";
  return (
    <InfoBoxIconTextLine
      text={
        <Stack direction="row" alignItems="center" columnGap={1} rowGap={0} flexWrap="wrap">
          {labels.map((label, index) => (
            <Typography key={index} variant="body1" color={colors[index]} sx={{ textShadow }}>
              {label}
            </Typography>
          ))}
        </Stack>
      }
      isSecondary
    />
  );
}

//#endregion

//#region Campaign Player Table

export function CampaignPlayerTable({ campaign, players, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "campaign.tabs.players" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const [showAll, setShowAll] = useState(false);
  const [actuallyShowAll, setActuallyShowAll] = useState(false);

  useEffect(() => {
    if (showAll) {
      setActuallyShowAll(true);
    }
  }, [showAll]);

  const reducedPlayerAmount = 100;
  const playersToShow = actuallyShowAll
    ? Object.values(players)
    : Object.values(players).slice(0, reducedPlayerAmount);
  return (
    <TableContainer component={Paper} {...props}>
      <Table size="small">
        <TableHead>
          <TableCell width={1} sx={{ pl: 1 }}></TableCell>
          <TableCell width={1} sx={{ pl: 1, pr: 0 }}>
            {t_g("player", { count: 30 })}
          </TableCell>
          <TableCell sx={{ pl: 0.5, pr: 1 }} colSpan={2}>
            {t("progress")}
          </TableCell>
          <TableCell width={1} sx={{ pl: 0, pr: 1, display: { xs: "none", md: "table-cell" } }}></TableCell>
          <TableCell width={1} sx={{ px: 1 }}></TableCell>
        </TableHead>
        <TableBody>
          {playersToShow.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                {t("no_players")}
              </TableCell>
            </TableRow>
          )}
          {playersToShow.map((player, index) => (
            <CampaignPlayerTableRow key={player.id} index={index} campaign={campaign} playerEntry={player} />
          ))}
          {!actuallyShowAll && players.length > reducedPlayerAmount && (
            <>
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="caption">
                    {t("more_players", { count: players.length - playersToShow.length })}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {showAll ? (
                    <LoadingSpinner />
                  ) : (
                    <Button size="small" fullWidth onClick={() => setShowAll(!showAll)}>
                      {t("show_all")}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
function CampaignPlayerTableRow({ index, campaign, playerEntry }) {
  const {
    palette: { campaignPage },
  } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const { player, stats, last_submission, highest_lobby_sweep, highest_lobby_sweep_fcs } = playerEntry;
  const mapsInCampaign = campaign.maps.filter((map) => !map.is_archived && !map.is_rejected).length;
  const hasAllClears = stats.clears === mapsInCampaign;
  const progressColor = hasAllClears ? "primary" : "success";
  const backgroundColor = hasAllClears ? campaignPage.sweepBackground : "transparent";
  const backgroundHover = hasAllClears
    ? campaignPage.sweepHightlightBackground
    : campaignPage.highlightBackground;
  const sweepColor =
    campaign.sort_major_name !== null ? campaign.sort_major_colors[highest_lobby_sweep] ?? "white" : null;
  const borderLeft = sweepColor ? "20px solid " + sweepColor : "none";

  const onClick = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <TableRow
        sx={{ backgroundColor, "&:hover": { backgroundColor: backgroundHover, cursor: "pointer" } }}
        onClick={onClick}
      >
        <TableCell width={1} align="center" sx={{ pl: 1, pr: 0, borderLeft }}>
          #{index + 1}
        </TableCell>
        <TableCell
          width={1}
          sx={{
            pl: 1,
            pr: 0,
            maxWidth: { xs: "120px", md: "150px" },
            minWidth: { xs: "120px", md: "150px" },
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <PlayerLink player={player} />
        </TableCell>
        <TableCell width={1} align="center" sx={{ pl: 0.5, pr: 0 }}>
          <Typography variant="caption">{((stats.clears / mapsInCampaign) * 100).toFixed(0)}%</Typography>
        </TableCell>
        <TableCell sx={{ pl: 1 }}>
          <LinearProgress
            variant="determinate"
            color={progressColor}
            value={(stats.clears / mapsInCampaign) * 100}
            max={100}
            sx={{ height: "6px", borderRadius: 1 }}
          />
        </TableCell>
        <TableCell width={1} align="right" sx={{ pl: 0, pr: 1, display: { xs: "none", md: "table-cell" } }}>
          <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-end">
            <span style={{ whiteSpace: "nowrap" }}>
              {stats.clears} / {mapsInCampaign}
            </span>
          </Stack>
        </TableCell>
        <TableCell width={1} sx={{ px: 1 }}>
          <Stack direction="row" gap={1} alignItems="center">
            <ChallengeFcIcon challenge={{ requires_fc: true, has_fc: false }} height="1.0em" />
            <span>{stats.full_clears}</span>
          </Stack>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={6} sx={{ pb: 2 }}>
            <CampaignPlayerTableRowExpanded player={player} campaign={campaign} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function CampaignPlayerTableRowExpanded({ player, campaign }) {
  const query = useGetCampaignViewPlayer(campaign.id, player.id);
  const validMaps = campaign.maps.filter((map) => !map.is_archived && !map.is_rejected);
  const hasMajorSort = campaign.sort_major_name !== null;

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const mapData = getQueryData(query); //dictionary with map id => map object, map.challenges[0].submission[0] is the submission object

  return (
    <Stack direction="column" gap={1}>
      {/* <Typography variant="h6">Player Details</Typography> */}
      {hasMajorSort ? (
        campaign.sort_major_labels.map((major, index) => {
          const maps = campaign.maps.filter((map) => map.sort_major === index);
          const countCompleted = maps.reduce((acc, map) => {
            return acc + (mapData[map.id] !== undefined ? 1 : 0);
          }, 0);
          return (
            <>
              <Stack direction="row" gap={1} alignItems="center">
                <Typography variant="h6">{major}</Typography>
                <Typography variant="body1" color="text.secondary">
                  ({countCompleted} / {maps.length})
                </Typography>
              </Stack>
              <CampaignPlayerTableRowExpandedMapGroup
                key={index}
                majorSort={index}
                maps={maps}
                mapData={mapData}
                campaign={campaign}
              />
            </>
          );
        })
      ) : (
        <CampaignPlayerTableRowExpandedMapGroup maps={validMaps} mapData={mapData} campaign={campaign} />
      )}
    </Stack>
  );
}
function CampaignPlayerTableRowExpandedMapGroup({ maps, mapData, campaign }) {
  const hasMajorSort = campaign.sort_major_name !== null;
  const hasMinorSort = campaign.sort_minor_name !== null;
  const borderLeft = hasMajorSort ? "10px solid " + campaign.sort_major_colors[maps[0].sort_major] : "none";
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableBody>
          {maps.map((map) => {
            const hasSubmission = mapData[map.id] !== undefined;
            const submission = hasSubmission ? mapData[map.id].challenges[0].submissions[0] : null;
            const borderRight = hasMinorSort
              ? "15px solid " + campaign.sort_minor_colors[map.sort_minor]
              : "none";
            return (
              <TableRow key={map.id}>
                <TableCell sx={{ px: 2, borderLeft }}>
                  <StyledLink to={"/map/" + map.id}>{getMapName(map, campaign)}</StyledLink>
                </TableCell>
                <TableCell width={1} align="right" sx={{ px: 2, borderRight }}>
                  <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-end">
                    {hasSubmission ? (
                      <>
                        <SubmissionFcIcon submission={submission} />
                        <StyledLink to={"/submission/" + submission.id}>
                          <FontAwesomeIcon icon={faBook} />
                        </StyledLink>
                        <FontAwesomeIcon icon={faCheckCircle} color="green" />
                      </>
                    ) : (
                      <FontAwesomeIcon icon={faXmark} color="red" />
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

//#endregion

//#region Campaign Map List

export function CampaignMapList({ campaign, ...props }) {
  const hasMajorSort = campaign.sort_major_name !== null;

  if (hasMajorSort) {
    return campaign.sort_major_labels.map((major, index) => {
      const maps = campaign.maps.filter((map) => map.sort_major === index);
      return (
        <CampaignMapListMajorGroup key={index} majorSort={index} maps={maps} campaign={campaign} {...props} />
      );
    });
  }

  return <CampaignMapListBasic maps={campaign.maps} campaign={campaign} {...props} />;
}

function CampaignMapListMajorGroup({ maps, campaign, majorSort, sx = {}, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "campaign.info_boxes" });
  const mapCount = maps.length;
  return (
    <Grid container sx={sx} columnSpacing={1} {...props}>
      <Grid item xs="auto">
        <Box sx={{ background: campaign.sort_major_colors[majorSort], height: "100%", width: "10px" }}></Box>
      </Grid>
      <Grid item xs>
        <Stack direction="column" gap={1}>
          <Stack direction="row" gap={1} alignItems="center">
            <Typography variant="h4">{campaign.sort_major_labels[majorSort]}</Typography>
            <Typography variant="body1" color="text.secondary">
              ({t("maps", { count: mapCount })})
            </Typography>
          </Stack>
          <CampaignMapListBasic maps={maps} campaign={campaign} />
        </Stack>
      </Grid>
    </Grid>
  );
}
function CampaignMapListBasic({ maps, campaign, sx = {}, ...props }) {
  return (
    <Stack direction="column" gap={1} sx={sx} {...props}>
      {maps.map((map) => (
        <CampaignMapListMapEntry key={map.id} map={map} campaign={campaign} />
      ))}
    </Stack>
  );
}
function CampaignMapListMapEntry({ map, campaign, sx = {}, ...props }) {
  const { settings } = useAppSettings();
  const theme = useTheme();
  const isMdScreen = useMediaQuery(theme.breakpoints.up("md"));
  const useTextFcIcons = settings.visual.topGoldenList.useTextFcIcons;
  const hasMinorSort = campaign.sort_minor_name !== null;
  const sortColor = hasMinorSort ? campaign.sort_minor_colors[map.sort_minor] : null;
  const textShadow =
    "black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px, black 0px 0px 1px";
  return (
    <BorderedBox sx={{ p: 1, borderRadius: 1, ...sx }} {...props}>
      <Stack direction="row" gap={1} alignItems="center">
        <Stack direction="column" gap={0.25}>
          <StyledLink to={"/map/" + map.id}>
            <Typography variant="h6">{getMapName(map, campaign)}</Typography>
          </StyledLink>
          <Stack direction="column" gap={0.5} sx={{ pl: 2 }}>
            {map.challenges.map((challenge) => (
              <Stack direction="row" gap={2} alignItems="center">
                <StyledLink to={"/challenge/" + challenge.id} key={challenge.id}>
                  <Stack direction="row" gap={1} alignItems="center">
                    {getChallengeNameShort(
                      challenge,
                      true,
                      isMdScreen ? true : useTextFcIcons ? true : false
                    )}
                    <ChallengeFcIcon
                      challenge={challenge}
                      style={{ display: isMdScreen ? "block" : useTextFcIcons ? "none" : "block" }}
                    />
                  </Stack>
                </StyledLink>
                <DifficultyChip difficulty={challenge.difficulty} />
              </Stack>
            ))}
          </Stack>
        </Stack>
        {hasMinorSort && (
          <Typography variant="body1" sx={{ ml: "auto", color: sortColor, textShadow }}>
            {campaign.sort_minor_labels[map.sort_minor]}
          </Typography>
        )}
      </Stack>
    </BorderedBox>
  );
}

//#endregion

//#region Campaign Challenge List

function CampaignChallengeList({ campaign, ...props }) {
  return (
    <Stack direction="column" gap={1} {...props}>
      {campaign.challenges.map((challenge) => (
        <CampaignChallengeEntry key={challenge.id} challenge={challenge} campaign={campaign} />
      ))}
    </Stack>
  );
}
function CampaignChallengeEntry({ challenge, campaign, sx = {}, ...props }) {
  const theme = useTheme();
  return (
    <BorderedBox sx={{ p: 1, borderRadius: 1, ...sx }} {...props}>
      <Stack direction="column" gap={0.25}>
        <StyledLink to={"/challenge/" + challenge.id}>
          <Typography variant="h6">{getChallengeNameShort(challenge, true, true)}</Typography>
        </StyledLink>
        {challenge.description && <Typography variant="body1">{challenge.description}</Typography>}
      </Stack>
    </BorderedBox>
  );
}

//#endregion

export function PageCampaignTopGoldenList({ id }) {
  const query = useGetCampaignView(id);
  const [filter, setFilter] = useLocalStorage("top_golden_list_filter", getDefaultFilter());

  if (query.isLoading) {
    return (
      <BasicBox>
        <LoadingSpinner />
      </BasicBox>
    );
  } else if (query.isError) {
    return (
      <BasicBox>
        <ErrorDisplay error={query.error} />
      </BasicBox>
    );
  }

  const response = getQueryData(query);

  return (
    <Box sx={{ mx: 2 }}>
      <BasicBox sx={{ mb: 1 }}>
        <Typography variant="h4">
          Top Golden List: <StyledLink to={`/campaign/${id}`}>{response.campaign.name}</StyledLink>
        </Typography>
        <SubmissionFilter type="campaign" id={id} filter={filter} setFilter={setFilter} />
      </BasicBox>
      <TopGoldenList type="campaign" id={id} filter={filter} />
    </Box>
  );
}
