import React from "react";
import { useTranslation } from "react-i18next";
import { SubmitBar, ActionBar, Menu } from "@egovernments/digit-ui-react-components";

function ApplicationDetailsActionBar({ workflowDetails, displayMenu, onActionSelect, setDisplayMenu, businessService, forcedActionPrefix,ActionBarStyle={},MenuStyle={} }) {
  const { t } = useTranslation();
  const user = Digit.UserService.getUser();
  const userRoles = user?.info?.roles?.map((e) => e.code);
  let isSingleButton = false;
  let isMenuBotton = false;

  let actions = workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
    return userRoles.some((role) => e.roles?.includes(role)) || !e.roles;
  });

  if (((window.location.href.includes("/obps") || window.location.href.includes("/noc")) && actions?.length == 1) || (actions?.[0]?.redirectionUrl?.pathname.includes("/pt/property-details/")) && actions?.length == 1) {
    isMenuBotton = false;
    isSingleButton = true; 
  } else if (actions?.length > 0) {
    isMenuBotton = true; 
    isSingleButton = false;
  }

  return (
    <React.Fragment>
      {!workflowDetails?.isLoading && isMenuBotton && !isSingleButton && (
        <ActionBar style={{...ActionBarStyle}}>
          {displayMenu && workflowDetails?.data?.actionState?.nextActions ? (
            <Menu
              localeKeyPrefix={forcedActionPrefix || `WF_EMPLOYEE_${businessService?.toUpperCase()}`}
              options={actions}
              optionKey={"action"}
              t={t}
              onSelect={onActionSelect}
              style={MenuStyle}
            />
          ) : null}
          <SubmitBar label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
        </ActionBar>
      )}
      {!workflowDetails?.isLoading && !isMenuBotton && isSingleButton && (
        <ActionBar style={{...ActionBarStyle}}>
          <button
              style={{ color: "#FFFFFF", fontSize: "19px" }}
              className={"submit-bar"}
              name={actions?.[0]?.action}
              value={actions?.[0]?.action}
              onClick={(e) => { onActionSelect(actions?.[0] || {})}}>
              {t(`${forcedActionPrefix || `WF_EMPLOYEE_${businessService?.toUpperCase()}`}_${actions?.[0]?.action}`)}
            </button>
        </ActionBar>
      )}
    </React.Fragment>
  );
}

export default ApplicationDetailsActionBar;
