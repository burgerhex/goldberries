import { useQuery } from "react-query";
import { fetchTopGoldenList } from "../util/api";
import { BasicBox, ErrorDisplay, LoadingSpinner, StyledExternalLink, StyledLink } from "./BasicComponents";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  darken,
} from "@mui/material";
import { getChallengeReference, getNewDifficultyColors } from "../util/constants";
import { Link } from "react-router-dom";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faEdit,
  faExternalLink,
  faHashtag,
  faInfoCircle,
  faList,
} from "@fortawesome/free-solid-svg-icons";
import { ChallengeDisplay, ChallengeSubmissionTable } from "../pages/Challenge";
import { getChallengeSuffix, getMapName } from "../util/data_util";
import {
  CampaignIcon,
  ChallengeFcIcon,
  DifficultyChip,
  OtherIcon,
  SubmissionFcIcon,
} from "../components/GoldberriesComponents";
import { useAuth } from "../hooks/AuthProvider";
import { getQueryData } from "../hooks/useApi";
import { useLocalStorage } from "@uidotdev/usehooks";
import { CustomModal, useModal } from "../hooks/useModal";
import { FormChallengeWrapper } from "./forms/Challenge";
import { useTheme } from "@emotion/react";
import { useAppSettings } from "../hooks/AppSettingsProvider";
import { MapDisplay } from "../pages/Map";
import Color from "color";
import { useTranslation } from "react-i18next";

export function TopGoldenList({ type, id, filter, isOverallList = false }) {
  return (
    <Stack direction="column" gap={1}>
      <TopGoldenListComponent type={type} id={id} filter={filter} isOverallList={isOverallList} />
    </Stack>
  );
}
function TopGoldenListComponent({ type, id, filter, isOverallList = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.top_golden_list" });
  const { settings } = useAppSettings();
  const [useSuggestedDifficulties, setUseSuggestedDifficulties] = useLocalStorage(
    "top_golden_list_useSuggestedDifficulties",
    false
  );
  const currentKey =
    "" +
    type +
    id +
    filter.archived +
    filter.arbitrary +
    filter.hide_objectives.join(",") +
    settings.visual.topGoldenList.showCampaignIcons +
    settings.visual.topGoldenList.darkenTierColors +
    settings.visual.topGoldenList.useTextFcIcons;
  const [renderUpTo, setRenderUpTo] = useState({ key: currentKey, index: 0 });

  const query = useQuery({
    queryKey: ["top_golden_list", type, id, filter],
    queryFn: () => fetchTopGoldenList(type, id, filter),
  });

  // Reset the render up to index when the key changes
  useEffect(() => {
    // console.log("Checking to see if key changed");
    if (currentKey !== renderUpTo.key) {
      // console.log("Resetting render up to index");
      setRenderUpTo({ key: currentKey, index: 0 });
    }
  }, [
    type,
    id,
    filter.archived,
    filter.arbitrary,
    filter.hide_objectives,
    settings.visual.topGoldenList.showCampaignIcons,
    settings.visual.topGoldenList.darkenTierColors,
    settings.visual.topGoldenList.useTextFcIcons,
  ]);

  // Set horizontal overflow only for this page
  useEffect(() => {
    document.body.parentElement.style.overflowX = "auto";
    return () => {
      document.body.parentElement.style.overflowX = "hidden";
    };
  }, []);

  const modalRefs = {
    map: {
      show: useRef(),
    },
    challenge: {
      edit: useRef(),
    },
  };

  const onFinishRendering = useCallback((index) => {
    if (index !== renderUpTo.index) return;
    setTimeout(() => {
      setRenderUpTo((prev) => {
        return { key: prev.key, index: prev.index + 1 };
      });
    }, 50);
  });
  const showMap = useCallback((id, challengeId, isCampaign) => {
    modalRefs.map.show.current.open({ id, challengeId, isCampaign });
  });
  const openEditChallenge = useCallback((id) => {
    modalRefs.challenge.edit.current.open({ id });
  });

  if (query.isLoading) {
    return (
      <BasicBox sx={{ width: "fit-content" }}>
        <LoadingSpinner />
      </BasicBox>
    );
  } else if (query.isError) {
    return (
      <BasicBox sx={{ width: "fit-content" }}>
        <ErrorDisplay error={query.error} />
      </BasicBox>
    );
  }

  const topGoldenList = getQueryData(query);
  const isPlayer = type === "player";

  return (
    <Stack direction="column" gap={1}>
      {isPlayer && (
        <BasicBox>
          <Stack direction="row" spacing={2} sx={{ py: 0 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={useSuggestedDifficulties}
                  onChange={(e) => setUseSuggestedDifficulties(e.target.checked)}
                />
              }
              label={t("use_suggested")}
            />
          </Stack>
        </BasicBox>
      )}
      {topGoldenList.challenges.length === 0 && (
        <BasicBox>
          <Typography variant="body2" color="textSecondary">
            {t("empty")}
          </Typography>
        </BasicBox>
      )}
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        gap={1}
      >
        {topGoldenList.tiers.map((tier, index) => {
          if (currentKey !== renderUpTo.key) return null;
          return (
            <MemoTopGoldenListGroup
              key={currentKey + index}
              index={index}
              tier={tier}
              campaigns={topGoldenList.campaigns}
              maps={topGoldenList.maps}
              challenges={topGoldenList.challenges}
              isPlayer={isPlayer}
              useSuggested={isPlayer && useSuggestedDifficulties}
              openEditChallenge={openEditChallenge}
              showMap={showMap}
              render={index <= renderUpTo.index}
              onFinishRendering={onFinishRendering}
              isOverallList={isOverallList}
            />
          );
        })}
      </Stack>
      <ModalContainer modalRefs={modalRefs} />
    </Stack>
  );
}

function TopGoldenListGroup({
  index,
  tier,
  campaigns,
  maps,
  challenges,
  isPlayer = false,
  useSuggested = false,
  openEditChallenge,
  showMap,
  render,
  onFinishRendering,
  isOverallList,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.top_golden_list" });
  const theme = useTheme();
  const name = tier[0].name;
  const { settings } = useAppSettings();
  const colors = getNewDifficultyColors(settings, tier[0].id, true);
  const [collapsed, setCollapsed] = useState(false);
  const glowColor = darken(colors.group_color, 0.5);

  useEffect(() => {
    if (render) onFinishRendering(index);
  }, [render]);

  if (!render) return null;

  const tierMap = tier.map((subtier) => subtier.id);
  const isEmptyTier =
    challenges.filter((challenge) =>
      tierMap.includes(
        useSuggested
          ? challenge.submissions[0].suggested_difficulty?.id ?? challenge.difficulty.id
          : challenge.difficulty.id
      )
    ).length === 0;

  if (settings.visual.topGoldenList.hideEmptyTiers && isEmptyTier) {
    return null;
  }

  const cellStyle = {
    borderBottom: "1px solid " + theme.palette.tableDivider,
  };

  return (
    <>
      <Stack direction="column" gap={1}>
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead onClick={() => setCollapsed(!collapsed)}>
              <TableRow>
                <TableCell
                  sx={{
                    ...cellStyle,
                    p: 0,
                    pl: 1,
                  }}
                ></TableCell>
                <TableCell colSpan={1} sx={{ ...cellStyle, pl: 1 }}>
                  <Typography fontWeight="bold" sx={{ textTransform: "capitalize", whiteSpace: "nowrap" }}>
                    {name}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    ...cellStyle,
                    borderLeft: "1px solid " + theme.palette.tableDivider,
                    display: useSuggested ? "none" : "table-cell",
                  }}
                  align="center"
                >
                  <Typography fontWeight="bold" textAlign="center">
                    {isPlayer ? (
                      <Tooltip title={t("note_suggested_difficulties")} arrow placement="top">
                        {useSuggested ? "Actual" : "Sug."}
                      </Tooltip>
                    ) : (
                      <Tooltip title={t("note_number_people")} arrow placement="top">
                        <FontAwesomeIcon icon={faHashtag} fontSize=".8em" />
                      </Tooltip>
                    )}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    ...cellStyle,
                    borderLeft: "1px solid " + theme.palette.tableDivider,
                  }}
                  align="center"
                >
                  <Typography fontWeight="bold">
                    <Tooltip title={t("note_video_link")} arrow placement="top">
                      <FontAwesomeIcon icon={faExternalLink} fontSize=".8em" />
                    </Tooltip>
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            {collapsed || !render ? null : (
              <TableBody>
                {isEmptyTier && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" style={{ padding: "2px 8px" }}>
                      <Typography variant="body2" color="textSecondary">
                        -
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {tier.map((subtier, index) => {
                  const tierChallenges = challenges.filter(
                    (challenge) =>
                      (useSuggested
                        ? challenge.submissions[0].suggested_difficulty?.id ?? challenge.difficulty.id
                        : challenge.difficulty.id) === subtier.id
                  );

                  let hadEntriesBefore = false;
                  if (index > 0) {
                    // Check if the previous subtier had entries
                    const previousSubtier = tier[index - 1];
                    const previousTierChallenges = challenges.filter(
                      (challenge) =>
                        (useSuggested
                          ? challenge.submissions[0].suggested_difficulty?.id ?? challenge.difficulty.id
                          : challenge.difficulty.id) === previousSubtier.id
                    );
                    hadEntriesBefore = previousTierChallenges.length > 0;
                  }

                  return (
                    <TopGoldenListSubtier
                      key={subtier.id}
                      subtier={subtier}
                      challenges={tierChallenges}
                      maps={maps}
                      campaigns={campaigns}
                      isPlayer={isPlayer}
                      useSuggested={useSuggested}
                      openEditChallenge={openEditChallenge}
                      showMap={showMap}
                      isOverallList={isOverallList}
                      hadEntriesBefore={hadEntriesBefore}
                    />
                  );
                })}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Stack>
    </>
  );
}
const MemoTopGoldenListGroup = memo(TopGoldenListGroup, (prevProps, newProps) => {
  return (
    prevProps.index === newProps.index &&
    prevProps.render === newProps.render &&
    prevProps.useSuggested === newProps.useSuggested
  );
});

function TopGoldenListSubtier({
  subtier,
  challenges,
  maps,
  campaigns,
  isPlayer,
  useSuggested,
  openEditChallenge,
  showMap,
  isOverallList,
  hadEntriesBefore,
}) {
  //Sort challenges by getMapName(challenge.map, challenge.map.campaign)
  challenges.sort((a, b) => {
    const mapA = maps[a.map_id];
    const mapB = maps[b.map_id];
    const campaignA = mapA === undefined ? campaigns[a.campaign_id] : campaigns[mapA.campaign_id];
    const campaignB = mapB === undefined ? campaigns[b.campaign_id] : campaigns[mapB.campaign_id];
    return getMapName(mapA, campaignA).localeCompare(getMapName(mapB, campaignB));
  });

  const isFwgSubtier = subtier.id === 12; //low tier 3 -> add fwg at the end

  return (
    <>
      {challenges.map((challenge, index) => {
        const map = maps[challenge.map_id];
        const campaign = map === undefined ? campaigns[challenge.campaign_id] : campaigns[map.campaign_id];

        return (
          <TopGoldenListRow
            key={challenge.id}
            subtier={subtier}
            challenge={challenge}
            campaign={campaign}
            map={map}
            isPlayer={isPlayer}
            useSuggested={useSuggested}
            openEditChallenge={openEditChallenge}
            showMap={showMap}
            showDivider={index === 0 && hadEntriesBefore}
          />
        );
      })}
      {isFwgSubtier && isOverallList ? <TopGoldenListFwgRow /> : null}
    </>
  );
}

function TopGoldenListRow({
  subtier,
  challenge,
  campaign,
  map,
  isPlayer,
  useSuggested,
  openEditChallenge,
  showMap,
  showDivider = false,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "components.top_golden_list" });
  const auth = useAuth();
  const theme = useTheme();
  const { settings } = useAppSettings();
  const tpgSettings = settings.visual.topGoldenList;
  const darkmode = settings.visual.darkmode;
  const colors = getNewDifficultyColors(settings, subtier.id, true);
  const challengeRef = getChallengeReference(challenge.id);
  const isReference = challengeRef !== null;

  const rowStyle = {
    backgroundColor: colors.color,
    color: colors.contrast_color,
  };
  const cellStyle = {
    padding: "2px 8px",
    borderBottom: "1px solid " + theme.palette.tableDivider,
  };
  if (showDivider) cellStyle.borderTop = "3px solid " + theme.palette.tableDividerStrong;

  let nameSuffix = getChallengeSuffix(challenge) === null ? "" : `${getChallengeSuffix(challenge)}`;
  let name = nameSuffix !== "" ? `${getMapName(map, campaign)}` : getMapName(map, campaign);
  if (nameSuffix !== "") {
    if (tpgSettings.switchMapAndChallenge) {
      nameSuffix = ` [${nameSuffix}]`;
    } else {
      name = ` [${name}]`;
    }
  }
  let suffixColor = new Color(colors.contrast_color);
  if (suffixColor.isDark()) {
    suffixColor = suffixColor.lightness(25).string();
  } else {
    suffixColor = suffixColor.lightness(75).string();
  }

  const firstSubmission = challenge.submissions[0];
  const firstSubmissionSuggestion = firstSubmission.suggested_difficulty;

  const [overflowActive, setOverflowActive] = useState(false);
  const mapNameRef = useRef();
  function isOverflowActive(event) {
    return event.offsetWidth < event.scrollWidth;
  }
  useEffect(() => {
    if (isOverflowActive(mapNameRef.current)) {
      setOverflowActive(true);
      return;
    }
    setOverflowActive(false);
  }, [isOverflowActive]);

  const [descOverflowActive, setDescOverflowActive] = useState(false);
  const labelRef = useRef();
  useEffect(() => {
    if (labelRef.current && isOverflowActive(labelRef.current)) {
      setDescOverflowActive(true);
      return;
    }
    setDescOverflowActive(false);
  }, [isOverflowActive]);

  const nameElement = (
    <span
      ref={mapNameRef}
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        color: nameSuffix !== "" && !tpgSettings.switchMapAndChallenge ? suffixColor : "inherit",
        order: tpgSettings.switchMapAndChallenge ? 1 : 2,
        // fontWeight: isReference ? "bold" : "normal",
      }}
    >
      {name}
    </span>
  );
  const labelElement = (
    <span
      ref={labelRef}
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        color: tpgSettings.switchMapAndChallenge ? suffixColor : "inherit",
        order: tpgSettings.switchMapAndChallenge ? 2 : 1,
      }}
    >
      {nameSuffix}
    </span>
  );

  return (
    <TableRow style={rowStyle}>
      <TableCell
        sx={{
          ...rowStyle,
          ...cellStyle,
          p: 0,
          pl: 1,
        }}
        align="center"
      >
        <Stack direction="row" gap={1} alignItems="center" justifyContent="center">
          <ChallengeFcIcon challenge={challenge} height="1.3em" isTopGoldenList />
        </Stack>
      </TableCell>
      <TableCell
        sx={{
          ...rowStyle,
          ...cellStyle,
          textAlign: "left",
          pl: 1,
        }}
      >
        <Stack direction="row" gap={1} alignItems="center">
          <Box
            component="span"
            sx={{
              whiteSpace: {
                xs: "normal",
                sm: "nowrap",
              },
            }}
          >
            <Stack
              direction="row"
              gap={0.5}
              sx={{
                cursor: "pointer",
                color: "inherit",
                textDecoration: "none",
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: darkmode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)",
                },
                maxWidth: "250px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onClick={() =>
                showMap(
                  map?.id ?? challenge.id,
                  map !== null ? challenge.id : null,
                  map === null || map === undefined
                )
              }
            >
              {overflowActive ? (
                <Tooltip title={name} arrow placement="top">
                  {nameElement}
                </Tooltip>
              ) : (
                nameElement
              )}
              {nameSuffix !== "" &&
                (descOverflowActive ? (
                  <Tooltip title={nameSuffix} arrow placement="top">
                    {labelElement}
                  </Tooltip>
                ) : (
                  labelElement
                ))}
            </Stack>
          </Box>
          {settings.visual.topGoldenList.showCampaignIcons && (
            <CampaignIcon campaign={campaign} height="1em" doLink />
          )}
          {isReference && (
            <Tooltip title="This challenge serves as a primary difficulty reference" arrow placement="top">
              <span style={{ userSelect: "none", cursor: "default" }}>🟊</span>
            </Tooltip>
          )}
          {isPlayer &&
            useSuggested &&
            firstSubmission.suggested_difficulty_id !== null &&
            firstSubmission.suggested_difficulty_id !== challenge.difficulty_id && (
              <Tooltip
                title={
                  <span>
                    <DifficultyChip
                      difficulty={challenge.difficulty}
                      prefix={t("placement_difficulty") + " "}
                    />
                  </span>
                }
                arrow
                placement="top"
              >
                <FontAwesomeIcon icon={faInfoCircle} color="lightgrey" />
              </Tooltip>
            )}
        </Stack>
      </TableCell>
      <TableCell
        style={{
          ...rowStyle,
          ...cellStyle,
          display: useSuggested ? "none" : "table-cell",
          fontSize: "1em",
          borderLeft: "1px solid " + theme.palette.tableDivider,
        }}
        align="right"
      >
        {isPlayer ? (
          <Stack direction="row" gap={1} alignItems="center" justifyContent="center">
            <DifficultyChip
              difficulty={
                useSuggested
                  ? firstSubmissionSuggestion === null
                    ? null
                    : challenge.difficulty
                  : firstSubmissionSuggestion
              }
              isPersonal={firstSubmission.is_personal}
              highlightPersonal
            />
          </Stack>
        ) : (
          <Stack direction="row" gap={1} alignItems="center" justifyContent="flex-end" sx={{}}>
            {challenge.data.submission_count}
          </Stack>
        )}
      </TableCell>
      <TableCell style={{ ...rowStyle, ...cellStyle, borderLeft: "1px solid " + theme.palette.tableDivider }}>
        <Stack direction="row" gap={1} alignItems="center" justifyContent="center">
          {challenge.submissions.length === 0 ? null : (
            <StyledExternalLink
              style={{ color: "inherit", textDecoration: "none", lineHeight: "1" }}
              href={firstSubmission.proof_url}
              target="_blank"
              rel="noreferrer"
            >
              ▶
            </StyledExternalLink>
          )}
          {isPlayer ? (
            <StyledLink to={"/submission/" + firstSubmission.id} style={{ display: "flex" }}>
              {firstSubmission.is_fc ? (
                <SubmissionFcIcon submission={firstSubmission} height="1.0em" disableTooltip />
              ) : (
                <FontAwesomeIcon icon={faBook} />
              )}
            </StyledLink>
          ) : null}
        </Stack>
      </TableCell>
    </TableRow>
  );
}
function TopGoldenListFwgRow({}) {
  const theme = useTheme();
  const { settings } = useAppSettings();
  const tpgSettings = settings.visual.topGoldenList;
  const colors = getNewDifficultyColors(settings, 13, true); // guard tier 3 ID

  const rowStyle = {
    backgroundColor: colors.color,
    color: colors.contrast_color,
    borderTop: "3px solid " + theme.palette.tableDividerStrong,
  };
  const cellStyle = {
    padding: "2px 8px",
  };

  let name = "Farewell";

  return (
    <TableRow style={rowStyle}>
      <TableCell
        sx={{
          ...rowStyle,
          ...cellStyle,
          p: 0,
          pl: 1,
        }}
        align="center"
      >
        <Stack direction="row" gap={1} alignItems="center" justifyContent="center">
          <ChallengeFcIcon challenge={{ requires_fc: false, has_fc: true }} height="1.3em" isTopGoldenList />
        </Stack>
      </TableCell>
      <TableCell
        sx={{
          ...rowStyle,
          ...cellStyle,
          textAlign: "left",
          pl: 1,
        }}
      >
        <Stack direction="row" gap={1} alignItems="center">
          <Box
            component="span"
            sx={{
              whiteSpace: {
                xs: "normal",
                sm: "nowrap",
              },
            }}
          >
            <Stack
              direction="row"
              gap={0.5}
              sx={{
                cursor: "pointer",
                color: "inherit",
                textDecoration: "none",
                transition: "background-color 0.2s",
                maxWidth: "250px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              alignItems="center"
            >
              <StyledExternalLink
                style={{ color: "inherit", textDecoration: "none" }}
                href="https://docs.google.com/spreadsheets/d/1FesTb6qkgMz-dCn7YdioRydToWSQNTg1axFEIHU4FF8/edit#gid=583834938"
                target="_blank"
                rel="noreferrer"
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: "inherit",
                    fontWeight: "bold",
                  }}
                >
                  {name}
                </span>
              </StyledExternalLink>
              <OtherIcon url={"/icons/bird.png"} title={"Birb"} alt={"Birb"} height="1.2em" />
              <OtherIcon
                url="/icons/goldenberry-8x.png"
                title="Chapter 9 of vanilla Celeste"
                alt="Farewell Golden"
                height="1.2em"
              />
            </Stack>
          </Box>
        </Stack>
      </TableCell>
      <TableCell
        style={{
          ...rowStyle,
          ...cellStyle,
          display: "table-cell",
          fontSize: "1em",
          borderLeft: "1px solid " + theme.palette.tableDivider,
        }}
        align="center"
      >
        <StyledExternalLink
          style={{ color: "inherit", textDecoration: "none" }}
          href="https://docs.google.com/spreadsheets/d/1FesTb6qkgMz-dCn7YdioRydToWSQNTg1axFEIHU4FF8/edit#gid=583834938"
          target="_blank"
          rel="noreferrer"
        >
          <Typography>650+</Typography>
        </StyledExternalLink>
      </TableCell>
      <TableCell style={{ ...rowStyle, ...cellStyle, borderLeft: "1px solid " + theme.palette.tableDivider }}>
        <Stack direction="row" gap={1} alignItems="center" justifyContent="center">
          <StyledExternalLink
            style={{ color: "inherit", textDecoration: "none", lineHeight: "1" }}
            href="https://docs.google.com/spreadsheets/d/1FesTb6qkgMz-dCn7YdioRydToWSQNTg1axFEIHU4FF8/edit#gid=583834938"
            target="_blank"
            rel="noreferrer"
          >
            ▶
          </StyledExternalLink>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

function ModalContainer({ modalRefs }) {
  const showMapModal = useModal();
  const editChallengeModal = useModal();

  // Setting the refs
  modalRefs.map.show.current = showMapModal;
  modalRefs.challenge.edit.current = editChallengeModal;

  return (
    <>
      <CustomModal modalHook={showMapModal} options={{ hideFooter: true }}>
        {showMapModal.data?.id == null ? (
          <LoadingSpinner />
        ) : showMapModal.data?.isCampaign ? (
          <ChallengeDisplay id={showMapModal.data.id} />
        ) : (
          <MapDisplay id={showMapModal.data.id} challengeId={showMapModal.data.challengeId} isModal />
        )}
      </CustomModal>

      <CustomModal modalHook={editChallengeModal} options={{ hideFooter: true }}>
        {editChallengeModal.data?.id == null ? (
          <LoadingSpinner />
        ) : (
          <FormChallengeWrapper id={editChallengeModal.data.id} onSave={editChallengeModal.close} />
        )}
      </CustomModal>
    </>
  );
}
