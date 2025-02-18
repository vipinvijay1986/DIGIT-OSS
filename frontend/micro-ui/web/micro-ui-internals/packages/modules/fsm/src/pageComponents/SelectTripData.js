import React, { useEffect, useState } from "react";
import { getVehicleType } from "../utils";
import { LabelFieldPair, CardLabel, TextInput, Dropdown, Loader, CardLabelError } from "@egovernments/digit-ui-react-components";
import { useLocation } from "react-router-dom";

const SelectTripData = ({ t, config, onSelect, formData = {}, userType }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const state = Digit.ULBService.getStateId();
  const { pathname: url } = useLocation();
  const editScreen = url.includes("/modify-application/");

  const [vehicle, setVehicle] = useState({ label: formData?.tripData?.vehicleCapacity });
  const [billError, setError] = useState(false);

  const { isLoading: isVehicleMenuLoading, data: vehicleData } = Digit.Hooks.fsm.useMDMS(state, "Vehicle", "VehicleType", { staleTime: Infinity });

  const { data: dsoData, isLoading: isDsoLoading, isSuccess: isDsoSuccess, error: dsoError } = Digit.Hooks.fsm.useDsoSearch(tenantId, { limit: -1 });

  const [vehicleMenu, setVehicleMenu] = useState([]);

  useEffect(() => {
    if (dsoData && vehicleData) {
      const allVehicles = dsoData.reduce((acc, curr) => {
        return curr.vehicles && curr.vehicles.length ? acc.concat(curr.vehicles) : acc;
      }, []);

      const cpacityMenu = Array.from(new Set(allVehicles.map(a => a.capacity)))
        .map(capacity => allVehicles.find(a => a.capacity === capacity))

      setVehicleMenu(cpacityMenu);
    }
  }, [dsoData, vehicleData]);


  const inputs = [
    {
      label: "ES_NEW_APPLICATION_PAYMENT_NO_OF_TRIPS",
      type: "number",
      name: "noOfTrips",
      error: t("ES_NEW_APPLICATION_NO_OF_TRIPS_INVALID"),
      validation: {
        isRequired: true,
        min: 1,
      },
      default: formData?.tripData?.noOfTrips,
      disable: editScreen || formData.paymentPreference === "POST_PAY" ? false : true,
      isMandatory: true,
    },
    {
      label: "ES_NEW_APPLICATION_AMOUNT_PER_TRIP",
      type: "text",
      name: "amountPerTrip",
      error: t("ES_NEW_APPLICATION_AMOUNT_INVALID"),
      validation: {
        isRequired: true,
        pattern: "[0-9]{1,10}",
        title: t("ES_APPLICATION_BILL_SLAB_ERROR"),
      },
      default: formData?.tripData?.amountPerTrip,
      disable: true,
      isMandatory: true,
    },
    {
      label: "ES_PAYMENT_DETAILS_TOTAL_AMOUNT",
      type: "text",
      name: "amount",
      validation: {
        isRequired: true,
        title: t("ES_APPLICATION_BILL_SLAB_ERROR"),
      },
      default: formData?.tripData?.amount,
      disable: true,
      isMandatory: true,
    },
  ];

  function setTripNum(value) {
    onSelect(config.key, { ...formData[config.key], noOfTrips: value });
  }

  function selectVehicle(value) {
    setVehicle({ label: value.capacity });
    onSelect(config.key, { ...formData[config.key], vehicleType: value });
  }

  function setValue(object) {
    onSelect(config.key, { ...formData[config.key], ...object });
  }
  useEffect(() => {
    (async () => {

      if (formData?.tripData?.vehicleType !== vehicle) {
        setVehicle({ label: formData?.tripData?.vehicleType?.capacity });
      }

      if (formData?.propertyType && formData?.subtype && formData?.address && formData?.tripData?.vehicleType?.capacity) {
        const capacity = formData?.tripData?.vehicleType.capacity;
        const { slum: slumDetails } = formData.address;
        const slum = slumDetails ? "YES" : "NO";
        const billingDetails = await Digit.FSMService.billingSlabSearch(tenantId, {
          propertyType: formData?.subtype,
          capacity,
          slum,
        });

        const billSlab = billingDetails?.billingSlab?.length && billingDetails?.billingSlab[0];
        if (billSlab?.price) {
          setValue({
            amountPerTrip: billSlab.price,
            amount: billSlab.price * formData.tripData.noOfTrips,
          });
          setError(false);
        } else {
          setValue({
            amountPerTrip: "",
            amount: "",
          });
          setError(true);
        }
      }
    })();
  }, [formData?.propertyType, formData?.subtype, formData?.address, formData?.tripData?.vehicleType?.capacity, formData?.tripData?.noOfTrips]);

  return isVehicleMenuLoading && isDsoLoading ? (
    <Loader />
  ) : (
    <div>
      <LabelFieldPair>
        <CardLabel className="card-label-smaller">{t("ES_NEW_APPLICATION_LOCATION_VEHICLE_REQUESTED") + " * "}</CardLabel>
        <Dropdown
          className="form-field"
          isMandatory
          option={vehicleMenu?.map((vehicle) => ({ ...vehicle, label: vehicle.capacity }))}
          optionKey="label"
          id="vehicle"
          selected={vehicle}
          select={selectVehicle}
          t={t}
          disable={formData?.tripData?.vehicleCapacity ? true : false}
        />
      </LabelFieldPair>
      {inputs?.map((input, index) => (
        <LabelFieldPair key={index}>
          <CardLabel className="card-label-smaller">
            {t(input.label)}
            {input.isMandatory ? " * " : null}
          </CardLabel>
          <div className="field">
            <TextInput
              type={input.type}
              onChange={(e) => setTripNum(e.target.value)}
              key={input.name}
              value={input.default ? input.default : formData && formData[config.key] ? formData[config.key][input.name] : null}
              {...input.validation}
              disable={input.disable}
            />
          </div>
        </LabelFieldPair>
      ))}
      {billError ? <CardLabelError style={{ width: "100%", textAlign: "center" }}>{t("ES_APPLICATION_BILL_SLAB_ERROR")}</CardLabelError> : null}
    </div>
  );
};

export default SelectTripData;
