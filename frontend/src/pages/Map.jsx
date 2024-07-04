import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChallengeDetailsList, ChallengeSubmissionTable } from "./Challenge";
import {
  faArrowRightToBracket,
  faArrowRightToFile,
  faBook,
  faEdit,
  faExternalLink,
  faFlagCheckered,
  faLandmark,
  faRightFromBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  getCampaignName,
  getChallengeFcLong,
  getChallengeFcShort,
  getChallengeName,
  getChallengeNameClean,
  getChallengeNameShort,
  getGamebananaEmbedUrl,
  getMapAuthor,
  getMapLobbyInfo,
} from "../util/data_util";
import {
  BasicContainerBox,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
  StyledExternalLink,
  StyledLink,
} from "../components/BasicComponents";
import { GoldberriesBreadcrumbs } from "../components/Breadcrumb";
import { ChallengeFcIcon, DifficultyChip, GamebananaEmbed } from "../components/GoldberriesComponents";
import { CustomModal, useModal } from "../hooks/useModal";
import { FormMapWrapper } from "../components/forms/Map";
import { useAuth } from "../hooks/AuthProvider";
import { getQueryData, useGetMap } from "../hooks/useApi";
import { Changelog } from "../components/Changelog";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export function PageMap() {
  const { id, challengeId } = useParams();

  return (
    <BasicContainerBox maxWidth="md">
      <MapDisplay id={parseInt(id)} challengeId={parseInt(challengeId)} />
    </BasicContainerBox>
  );
}

export function MapDisplay({ id, challengeId, isModal = false }) {
  const { t } = useTranslation(undefined, { keyPrefix: "map" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const auth = useAuth();
  const navigate = useNavigate();
  const query = useGetMap(id);
  const [selectedChallengeId, setSelectedChallengeId] = useState(challengeId ?? null);

  const updateSelectedChallenge = (challengeId) => {
    setSelectedChallengeId(challengeId);
    if (!isModal) {
      navigate("/map/" + id + "/" + challengeId, { replace: true });
    }
  };

  const editMapModal = useModal();

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const map = getQueryData(query);
  const firstChallenge = map.challenges[0];
  const selectedChallenge = map.challenges.find((c) => c.id === selectedChallengeId) ?? firstChallenge;
  const campaign = map.campaign;
  const title = map.name + " - " + getCampaignName(map.campaign, t_g);

  return (
    <>
      <HeadTitle title={title} />
      <GoldberriesBreadcrumbs campaign={map.campaign} map={map} />
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ mt: 1.5 }}>
        <GamebananaEmbed campaign={campaign} size="large" />
      </Stack>
      {auth.hasVerifierPriv && (
        <Stack direction="row" alignItems="center" justifyContent="flex-end">
          <Button
            onClick={editMapModal.open}
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faEdit} />}
            sx={{ mb: 1 }}
          >
            {t("buttons.edit")}
          </Button>
        </Stack>
      )}
      <ChallengeDetailsList map={map} />
      <Divider sx={{ my: 2 }}>
        <Chip label="Challenges" size="small" />
      </Divider>
      <Box sx={{ mt: 1, p: 1, background: "rgba(0,0,0,0.2)", borderRadius: 1 }}>
        <MapChallengeTabs selected={selectedChallenge.id} setSelected={updateSelectedChallenge} map={map} />
      </Box>
      <Stack direction="row" gap={1} alignItems="center" sx={{ m: 1 }}>
        <ChallengeFcIcon challenge={selectedChallenge} showClear height="1.3em" />
        <span>{getChallengeFcShort(selectedChallenge)}</span>
        <DifficultyChip difficulty={selectedChallenge.difficulty} />
        <StyledLink to={"/challenge/" + selectedChallenge.id} style={{ marginLeft: "auto" }}>
          <Button variant="text" startIcon={<FontAwesomeIcon icon={faArrowRightToBracket} />}>
            {t("buttons.view_challenge")}
          </Button>
        </StyledLink>
      </Stack>
      <ChallengeSubmissionTable key={selectedChallenge.id} challenge={selectedChallenge} />
      {/* {map.challenges.map((challenge) => {
        return (
          <>
            <Divider sx={{ my: 2 }}>
              <Link to={"/challenge/" + challenge.id}>
                <Chip label={getChallengeName(challenge, false)} size="small" />
              </Link>
            </Divider>
            <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 1 }}>
              <ChallengeFcIcon challenge={challenge} showClear height="1.3em" />
              <span>{getChallengeFcShort(challenge)}</span>
              <DifficultyChip difficulty={challenge.difficulty} />
            </Stack>
            <ChallengeSubmissionTable key={challenge.id} challenge={challenge} />
          </>
        );
      })} */}

      <Divider sx={{ my: 2 }} />
      <Changelog type="map" id={id} />

      <CustomModal modalHook={editMapModal} options={{ hideFooter: true }}>
        <FormMapWrapper id={id} onSave={editMapModal.close} />
      </CustomModal>
    </>
  );
}

//controlled property: selected challenge ID
function MapChallengeTabs({ selected, setSelected, map }) {
  //If too many challenges, instead render as select dropdown
  if (map.challenges.length > 5) {
    return (
      <Select
        value={selected}
        fullWidth
        onChange={(e) => setSelected(e.target.value)}
        MenuProps={{ disableScrollLock: true }}
      >
        {map.challenges.map((challenge) => (
          <MenuItem key={challenge.id} value={challenge.id}>
            {getChallengeNameShort(challenge, true)}
          </MenuItem>
        ))}
      </Select>
    );
  }
  return (
    <Stack direction="row" gap={1} flexWrap="wrap">
      {map.challenges.map((challenge) => (
        <Button
          key={challenge.id}
          onClick={() => setSelected(challenge.id)}
          variant={selected === challenge.id ? "contained" : "outlined"}
          sx={{ whiteSpace: "nowrap" }}
        >
          {getChallengeNameShort(challenge, true)}
        </Button>
      ))}
    </Stack>
  );
}
