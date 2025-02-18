import { Dropdown, FormComposer, InfoBannerIcon, Loader, Localities, RadioButtons, Toast } from "@egovernments/digit-ui-react-components";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory ,Link} from "react-router-dom";

const description = {
  description: "(or)",
  descriptionStyles: {
    fontWeight: "300",
    color: "#505A5F",
    marginTop: "0px",
    textAlign: "center",
  },
};

const SearchProperty = ({ config: propsConfig, onSelect, redirectToUrl }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { action = 0 } = Digit.Hooks.useQueryParams();
  const [searchData, setSearchData] = useState({});
  const [showToast, setShowToast] = useState(null);
  let allCities = Digit.Hooks.pt.useTenants()?.sort((a, b) => a?.i18nKey?.localeCompare?.(b?.i18nKey));
  // if called from tl module get tenants from tl usetenants
  allCities = allCities ? allCities : Digit.Hooks.tl.useTenants()?.sort((a, b) => a?.i18nKey?.localeCompare?.(b?.i18nKey));  
  const [cityCode, setCityCode] = useState();
  const [formValue, setFormValue] = useState();
  const { data: propertyData, isLoading: propertyDataLoading, error, isSuccess, billData } = Digit.Hooks.pt.usePropertySearchWithDue({
    tenantId: searchData?.city,
    filters: searchData?.filters,
    auth: true /*  to enable open search set false  */,
    configs: { enabled: Object.keys(searchData).length > 0, retry: false, retryOnMount: false, staleTime: Infinity },
  });

  useEffect(() => {
    showToast && setShowToast(null);
  }, [action, propertyDataLoading]);

  useLayoutEffect(() => {
    //Why do we need this? !!!!!
    const getActionBar = () => {
      let el = document.querySelector("div.action-bar-wrap");
      if (el) {
        el.style.position = "static";
        el.style.padding = "8px 0";
        el.style.boxShadow = "none";
        el.style.marginBottom = "16px";
      } else {
        setTimeout(() => {
          getActionBar();
        }, 100);
      }
    };
    getActionBar();
  }, []);

  const { data: ptSearchConfig, isLoading } = Digit.Hooks.pt.useMDMS(Digit.ULBService.getStateId(), "DIGIT-UI", "HelpText", {
    select: (data) => {
      return data?.["DIGIT-UI"]?.["HelpText"]?.[0]?.PT;
    },
  });

  const [mobileNumber, property, oldProperty, name, doorNumber] = propsConfig.inputs;

  const config = [
    {
      body: [
        {
          type: "custom",
          populators: {
            name: "addParam",
            defaultValue: { code: 0, name: t('PT_KNOW_PTID') },
            customProps: {
              t,
              isMandatory: true,
              optionsKey: "name",
              options: [
                { code: 0, name: t('PT_KNOW_PTID') },
                { code: 1, name: t('PT_SEARCH_DOOR_NO') },
              ],
            },
            component: (props, customProps) => (
              <RadioButtons
                {...customProps}
                selectedOption={props.value}
                onSelect={(d) => {
                  props?.setValue("city", {});
                  props?.setValue("locality", {});
                  props?.setValue("mobileNumber", "");
                  props?.setValue("propertyIds", "");
                  props?.setValue("doorNumber", "");
                  props?.setValue("oldPropertyId", "");
                  props?.setValue("name", "");
                  history.replace(`${history.location.pathname}?action=${action == 0 ? 1 : 0}`);
                }}
              />
            ),
          },
        },
        {
          label: "PT_SELECT_CITY",
          isMandatory: true,
          type: "custom",
          populators: {
            name: "city",
            defaultValue: null,
            rules: { required: true },
            customProps: { t, isMandatory: true, option: [...allCities], optionKey: "i18nKey" },
            component: (props, customProps) => (
              <Dropdown
                {...customProps}
                selected={props.value}
                select={(d) => {
                  Digit.LocalizationService.getLocale({
                    modules: [`rainmaker-${props?.value?.code}`],
                    locale: Digit.StoreData.getCurrentLanguage(),
                    tenantId: `${props?.value?.code}`,
                  });
                  if (d.code !== cityCode) props.setValue("locality", null);
                  props.onChange(d);
                }}
              />
            ),
          },
        },
        {
          label: mobileNumber.label,
          type: mobileNumber.type,
          populators: {
            defaultValue: "",
            name: mobileNumber.name,
            validation: mobileNumber?.validation,
          },
          ...description,
          isMandatory: false,
          isInsideBox: true,
          placementinbox: 0
        },
        {
          label: "",
          labelChildren: (
            <div className="tooltip" style={{position:"relative"}}>
              <div style={{display: "flex", alignItems: "center", gap: "0 4px"}}>
              <h2>{property.label}</h2>
              <InfoBannerIcon fill="#0b0c0c" />
              </div>
              <span className="tooltiptext" style={{ position:"absolute", whiteSpace: "nowrap" , fontSize:"medium" }}>
                {t(property.description)  + ptSearchConfig?.propertyIdFormat}
              </span>
            </div>
          ),
          type: property.type,
          populators: {
            name: property.name,
            defaultValue: "",
            validation: property?.validation,
          },
          ...description,
          isMandatory: false,
          isInsideBox: true,
          placementinbox: 1
        },
        {
          label: oldProperty.label,
          type: oldProperty.type,
          populators: {
            name: oldProperty.name,
            defaultValue: "",
            validation: oldProperty?.validation,
          },
          isMandatory: false,
          isInsideBox: true,
          placementinbox: 2
        },
      ],
      body1: [
        {
          type: "custom",
          populators: {
            name: "addParam1",
            defaultValue: { code: 1, name: t('PT_SEARCH_DOOR_NO') },
            customProps: {
              t,
              isMandatory: true,
              optionsKey: "name",
              options: [
                { code: 0, name: t('PT_KNOW_PTID') },
                { code: 1, name: t('PT_SEARCH_DOOR_NO') },
              ],
            },
            component: (props, customProps) => (
              <RadioButtons
                {...customProps}
                selectedOption={props.value}
                onSelect={(d) => {
                  props?.setValue("city", {});
                  props?.setValue("locality", {});
                  props?.setValue("mobileNumber", "");
                  props?.setValue("propertyIds", "");
                  props?.setValue("doorNumber", "");
                  props?.setValue("oldPropertyId", "");
                  props?.setValue("name", "");
                  history.replace(`${history.location.pathname}?action=${action == 0 ? 1 : 0}`);
                }}
              />
            ),
          },
        },
        {
          label: "PT_SELECT_CITY",
          isMandatory: true,
          type: "custom",
          populators: {
            name: "city",
            defaultValue: null,
            rules: { required: true },
            customProps: { t, isMandatory: true, option: [...allCities], optionKey: "i18nKey" },
            component: (props, customProps) => (
              <Dropdown
                {...customProps}
                selected={props.value}
                select={(d) => {
                  Digit.LocalizationService.getLocale({
                    modules: [`rainmaker-${props?.value?.code}`],
                    locale: Digit.StoreData.getCurrentLanguage(),
                    tenantId: `${props?.value?.code}`,
                  });
                  if (d.code !== cityCode) props.setValue("locality", null);
                  props.onChange(d);
                }}
              />
            ),
          },
        },
        {
          label: "PT_SELECT_LOCALITY",
          type: "custom",
          isMandatory: true,
          populators: {
            name: "locality",
            defaultValue: "",
            rules: { required: true },
            customProps: {},
            component: (props, customProps) => (
              <Localities
                selectLocality={(d) => {
                  props.onChange(d);
                }}
                tenantId={cityCode}
                boundaryType="revenue"
                keepNull={false}
                optionCardStyles={{ height: "600px", overflow: "auto", zIndex: "10" }}
                selected={formValue?.locality}
                disable={!cityCode}
                disableLoader={true}
              />
            ),
          },
        },
        {
          label: doorNumber.label,
          type: doorNumber.type,
          populators: {
            defaultValue: "",
            name: doorNumber.name,
            validation: doorNumber?.validation,
          },
          isMandatory: false,
        },
        {
          label: name.label,
          type: name.type,
          populators: {
            defaultValue: "",
            name: name.name,
            validation: name?.validation,
          },
          isMandatory: false,
        },
      ],
    },
  ];

  const onPropertySearch = async (data) => {
    if (!data?.city?.code) {
      setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS" });
      return;
    }
   
    if (action == 0) {
      if (!(data?.mobileNumber || data?.propertyIds || data?.oldPropertyId)) {
        setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS" });
        return;
      }
      if (data?.mobileNumber && !data.mobileNumber?.match(mobileNumber?.validation?.pattern?.value)) {
        setShowToast({ warning: true, label: mobileNumber?.validation?.pattern?.message });
        return;
      }
      if (data?.propertyIds && !data.propertyIds?.match(property?.validation?.pattern?.value)) {
        setShowToast({ warning: true, label: property?.validation?.pattern?.message });
        return;
      }
      if (data?.oldPropertyId && !data.oldPropertyId?.match(oldProperty?.validation?.pattern?.value)) {
        setShowToast({ warning: true, label: oldProperty?.validation?.pattern?.message });
        return;
      }
    } else {
      if (!data?.locality?.code) {
        setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS" });
        return;
      }
      if (!(data?.doorNumber || data?.name)) {
        setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS" });
        return;
      }

      if (data?.name && !data.name?.match(name?.validation?.pattern?.value)) {
        setShowToast({ warning: true, label: name?.validation?.pattern?.message });
        return;
      }
      if (data?.doorNumber && !data.doorNumber?.match(doorNumber?.validation?.pattern?.value)) {
        setShowToast({ warning: true, label: doorNumber?.validation?.pattern?.message });
        return;
      }
    }

    setShowToast(null);

    let tempObject = Object.keys(data)
      .filter((k) => data[k])
      .reduce((acc, key) => ({ ...acc, [key]: typeof data[key] === "object" ? data[key].code : data[key] }), {});
    let city = tempObject.city;
    delete tempObject.addParam;
    delete tempObject.addParam1;
    delete tempObject.city;
    setSearchData({ city: city, filters: tempObject });

    return;
  };
 const onFormValueChange = (setValue, data, formState) => {
    const mobileNumberLength = data?.[mobileNumber.name]?.length;
    const oldPropId = data?.[oldProperty.name];
    const propId = data?.[property.name];
    const city = data?.city;

    // if ((city!=null && Object.keys(city).length !=0) && !(mobileNumberLength > 0 || oldPropId!="" || propId!="")){
    //   setShowToast({ warning: true, label: "ERR_PT_FILL_VALID_FIELDS" });
    // }

    if (mobileNumberLength > 0 || oldPropId!="" || propId!="") {
    setShowToast(null);

    }
    if (city!=null && Object.keys(city).length !=0){
      setShowToast(null)
    }
    const locality = data?.locality;
    if (city?.code !== cityCode) {
      setCityCode(city?.code);
    }

    if (!_.isEqual(data, formValue)) {
      setFormValue(data);
    }

    if (!locality || !city) {
      return;
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (propertyData && !propertyDataLoading && !error) {
    let qs = {};
    qs = { ...searchData.filters, city: searchData.city };

    if (
      ptSearchConfig?.ptSearchCount &&
      searchData?.filters?.locality &&
      propertyDataLoading &&
      propertyDataLoading?.Properties?.length &&
      propertyDataLoading.Properties.length > ptSearchConfig.ptSearchCount
    ) {
      !showToast && setShowToast({ error: true, label: "PT_MODIFY_SEARCH_CRITERIA" });
    } else if (propsConfig.action === "MUTATION") {
      onSelect(propsConfig.key, qs, null, null, null, {
        queryParams: { ...qs },
      });
    } else {
      // beacuse of this commit 
      // https://github.com/egovernments/DIGIT-Dev/commit/2bae1c36dd1f8242bca30366da80c88d46b6aaaa#diff-3c34510e8b422f53eb9633d014f50024496ad79f952849e1b42fd61877562c4cR385
      // am adding one more condtion for this. 
      if(redirectToUrl || window.location.href.includes("digit-ui/citizen/commonpt/property/citizen-search")) {
        history.push(
          `/digit-ui/citizen/commonPt/property/search-results?${Object.keys(qs)
            .map((key) => `${key}=${qs[key]}`)
            .join("&")}${redirectToUrl ? `&redirectToUrl=${redirectToUrl}` : ''}`
        );
      } else {
        onSelect('cptSearchQuery', qs, null, null, null, {
          queryParams: { ...qs },
        });
      }
    }
  }

  if (error) {
    !showToast && setShowToast({ error: true, label: error?.response?.data?.Errors?.[0]?.code || error });
  }
  if (action == 1) {
    config[0].body = [...config[0].body1];
  }

  return (
    <div style={{ marginTop: "16px", marginBottom: "16px" ,backgroundColor:"white"}}>
      <FormComposer
        onSubmit={onPropertySearch}
        noBoxShadow
        inline
        config={config}
        label={propsConfig.texts.submitButtonLabel}
        heading={t(propsConfig.texts.header)}
        text={t(propsConfig.texts.text)}
        headingStyle={{ fontSize: "32px", marginBottom: "16px", fontFamily: "Roboto Condensed,sans-serif" }}
        onFormValueChange={onFormValueChange}
        cardStyle={{marginBottom:"0"}}
      ></FormComposer>
      <span className="link" style={{display:"flex", justifyContent:"center",paddingBottom:"16px"}}>
        <Link to={"/digit-ui/citizen/commonpt/property/new-application"}>{t("CPT_REG_NEW_PROPERTY")}</Link>
      </span>
      {showToast && (
        <Toast
          isDleteBtn={true}
          error={showToast.error}
          warning={showToast.warning}
          label={t(showToast.label)}
          onClose={() => {
            setShowToast(null);
          }}
        />
      )}
    </div>
  );
};

SearchProperty.propTypes = {
  loginParams: PropTypes.any,
};

SearchProperty.defaultProps = {
  loginParams: null,
};

export default SearchProperty;
