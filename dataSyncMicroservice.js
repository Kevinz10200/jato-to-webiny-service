
const { request } = require('express');
var sql = require('mssql'); // for getting sql JATO data
var rowCount = 0; // attempts at limiting number of concurrent requests
var rowFailedCount = 0; // ^
const https = require('https');// built in header for making requests
//require('dotenv').config();

var q = 0;

const config = {
    user: 'admin',
    password: 'Motortrend123',
    port: 1433,
    database:'cars',
    server: 'database-1.cffzwvas6kjf.us-east-1.rds.amazonaws.com',
    trustServerCertificate: true
};

sql.connect(config, err => {

    if (err) console.log(err);

    const request = new sql.Request();
    request.stream = true; // You can set streaming differently for each request
    request.query("select top(50) * from vehicle_view where make='porsche'"); // sql command to send to JATO

    // attempts at limiting number of concurrent requests
    let rowsToProcess = []; 
    request.on('row', row => {
        // Emitted for each row in a recordset
        rowsToProcess.push(row);
        if (rowsToProcess.length >= 1) {
            request.pause();
            processRows();
          }
          //console.log(row);
     });

    request.on('error', err => { // error handling for sql request
        console.log(err);
    });

    request.on('done', result => {
        // Always emitted as the last one
        //processRows();
        console.log('ALL DONE! %d rows processed, %d rows failed', rowCount, rowFailedCount);

    });


    async function processRows() { // graphQL request for creating new entry into JATO_CAR_DATA
        // process rows
        console.log(rowsToProcess.length);
        for (let i = 0; i < rowsToProcess.length; i++){

            console.log(rowsToProcess[i].MODEL_NAME);

            // graphql request here
            var data = {
                query: `# inserts JATO_CAR_DATA
                mutation{
                createJatoCarData(
                    data:{
                    vehicleId: ${parseInt(rowsToProcess[i].vehicle_id)},
                    mmy:{
                        make: "${rowsToProcess[i].MAKE}",
                        year: "${rowsToProcess[i].YEAR}",
                        model: "${rowsToProcess[i].MODEL_NAME}"
                    },
                    mainFeatures:{
                        manufactureCode: "${rowsToProcess[i].MANUFACTURE_CODE}",
                        trim: "${rowsToProcess[i].TRIM_NAME}",
                        combinedEpaMpg: "${rowsToProcess[i].COMBINED_EPA_MPG}",
                        bodyStyle:"${rowsToProcess[i].BODY_STYLE_PLACE_HOLDER}",
                        bodyType:"${rowsToProcess[i].BODY_TYPE_PLACE_HOLDER}",
                        doors:"${rowsToProcess[i].DOORS}",
                        drive:"${rowsToProcess[i].DRIVE_PLACE_HOLDER}"
                    },
                    exteriorDimension:{
                        wheelBase: "${rowsToProcess[i].WHEEL_BASE}",
                        width: "${rowsToProcess[i].WIDTH}",
                        length: "${rowsToProcess[i].LENGT}",
                        height: "${rowsToProcess[i].HEIGHT}",
                        groundClearance: "${rowsToProcess[i].GROUND_CLEARANCE}",
                        curbWeight: "${rowsToProcess[i].CURB_WEIGHT}"
                    },
                    capacity:{
                        seatingCapacity:"${rowsToProcess[i].SEATING_CAPACITY}",
                        gvwr:"${rowsToProcess[i].GVWR}",
                        cargoCapacity:"${rowsToProcess[i].CARGO_CAPACITY}",
                        payloadCapacity:"${rowsToProcess[i].PAYLOAD_CAPACITY}",
                        towingCapacity:"${rowsToProcess[i].TOWING_CAPACITY}",
                        fuelCapacity:"${rowsToProcess[i].FUEL_CAPACITY}"
                    },
                    interiorDimension:{
                        frontHeadRoom:"${rowsToProcess[i].FRONT_HEAD_ROOM}",
                        rearHeadRoom:"${rowsToProcess[i].REAR_HEAD_ROOM}",
                        frontShoulderRoom:"${rowsToProcess[i].FRONT_SHOLDER_ROOM}",
                        rearShoulderRoom:"${rowsToProcess[i].REAR_SHOLDER_ROOM}",
                        frontLegRoom:"${rowsToProcess[i].FRONT_LEG_ROOM}",
                        rearLegRoom:"${rowsToProcess[i].REAR_LEG_ROOM}"
                    },
                    drivetrainInfo:{
                        engineName:"${rowsToProcess[i].ENGINE_NAME_PLACE_HOLDER}",
                        engineSize:"${rowsToProcess[i].ENZINE_SIZE}",
                        horsePower:"${rowsToProcess[i].HORSE_POWER}",
                        torque:"${rowsToProcess[i].TORQUE}",
                        cylinderConfiguration:"${rowsToProcess[i].CYLINDER_CONFIGURATION}",
                        numberOfCylinder:"${rowsToProcess[i].NO_OF_CYLINDER}",
                        fuelType:"${rowsToProcess[i].FUEL_TYPE_PLACE_HOLDER}",
                        transmissionType:"${rowsToProcess[i].TRANSMISSION_TYPE_PLACE_HOLDER}",
                        transmissionSpeed:"${rowsToProcess[i].TRANSMISSION_SPEED}",
                        drivingRange: "${rowsToProcess[i].DRIVING_RANGE}"
                    },
                    nhtsa:{
                        nhtsaRatingFrontDriver: "${rowsToProcess[i].NHTSA_RATING_FRONT_DRIVER}",
                        nhtsaRatingFrontPassenger: "${rowsToProcess[i].NHTSA_RATING_FRONT_PASSENGER}",
                        nhtsaRatingFrontSide: "${rowsToProcess[i].NHTSA_RATING_FRONT_SIDE}",
                        nhtsaRatingRearSide: "${rowsToProcess[i].NHTSA_RATING_REAR_SIDE}",
                        nhtsaRatingOverall: "${rowsToProcess[i].NHTSA_RATING_OVERALL}",
                        nhtsaRatingRollover: "${rowsToProcess[i].NHTSA_RATING_ROLLOVER}"
                    },
                    iihs:{
                        iihsFrontModerateOverlap:"${rowsToProcess[i].IIHS_FRONT_MODERATE_OVERLAP}",
                        iihsOverallSideCrash:"${rowsToProcess[i].IIHS_OVERALL_SIDE_CRASH}",
                        iihsBestPick:"${rowsToProcess[i].IIHS_BEST_PICK}",
                        iihsRearCrash:"${rowsToProcess[i].IIHS_REAR_CRASH}",
                        iihsRoofStrength:"${rowsToProcess[i].IIHS_ROOF_STRENGTH}",
                        iihsFrontSmallOverlap:"${rowsToProcess[i].IIHS_FRONT_SMALL_OVERLAP}"
                    },
                    lights:{
                        daytimeRunningLights:"${rowsToProcess[i].DAYTIME_RUNNING_LIGHTS}",
                        daytimeRunningLights1:"${rowsToProcess[i].DAYTIME_RUNNING_LIGHTS_1}",
                        frontFogLights:"${rowsToProcess[i].FRONT_FOG_LIGHTS}",
                        frontFogLights1:"${rowsToProcess[i].FRONT_FOG_LIGHTS_1}",
                        rearFogLights:"${rowsToProcess[i].REAR_FOG_LIGHTS}",
                        rearFogLights1: "${rowsToProcess[i].REAR_FOG_LIGHTS_1}"
                    },
                    safetyFeatures:{
                        rearAirbag:"${rowsToProcess[i].REAR_AIRBAG}",
                        rearSideAirbag:"${rowsToProcess[i].REAR_SIDE_AIRBAG}",
                        sideAirbag:"${rowsToProcess[i].SIDE_AIRBAG}",
                        driverAirbag:"${rowsToProcess[i].DRIVER_AIRBAG}",
                        passengerAirbag:"${rowsToProcess[i].PASSENGER_AIRBAG}",
                        kneeAirbag:"${rowsToProcess[i].KNEE_AIRBAG}",
                        adjustablePedals:"${rowsToProcess[i].ADJUSTABLE_PEDALS}",
                        brakeAssist:"${rowsToProcess[i].BRAKE_ASSIST}",
                        heatedWiperWashers:"${rowsToProcess[i].HEATED_WIPER_WASHERS}",
                        parkingDistanceControl:"${rowsToProcess[i].PARKING_DISTANCE_CONTROL}",
                        limitedSlipDifferential:"${rowsToProcess[i].LIMITED_SLIP_DIFFERENTIAL}",
                        hillDescentControl:"${rowsToProcess[i].HILL_DESCENT_CONTROL}",
                        integratedChildSafetySeat:"${rowsToProcess[i].INTEGRATED_CHILD_SAFETY_SEAT}",
                        stabilityControl:"${rowsToProcess[i].STABILITY_CONTROL}",
                        theftDeterrentSystem: "${rowsToProcess[i].THEFT_DETERRENT_SYSTEM}"
                    },
                    warranty:{
                        fullWarrantyMiles:"${rowsToProcess[i].FULL_WARRANTY_MILES}",
                        fullWarrantyMonths:"${rowsToProcess[i].FULL_WARRANTY_MONTHS}",
                        powertrainWarrantyMiles:"${rowsToProcess[i].POWERTRAIN_WARRANTY_MILES}",
                        powertrainWarrantyMonths:"${rowsToProcess[i].POWERTRAIN_WARRANTY_MONTHS}",
                        maintenanceWarrantyMiles:"${rowsToProcess[i].MAINTENANCE_WARRANTY_MILES}",
                        maintenanceWarrantyMonths:"${rowsToProcess[i].MAINTENANCE_WARRANTY_MONTHS}",
                        roadsideWarrantyMiles:"${rowsToProcess[i].ROADSIDE_WARRANTY_MILES}",
                        roadsideWarrantyMonths:"${rowsToProcess[i].ROADSIDE_WARRANTY_MONTHS}",
                        corrosionWarrantyMiles:"${rowsToProcess[i].CORROSION_WARRANTY_MILES}",
                        corrosionWarrantyMonths: "${rowsToProcess[i].CORROSION_WARRANTY_MONTHS}"
                    }

                    })
                {
                    data
                    {
                    createdOn
                    }
                }

                }`,
            };
            console.log(q);
            
            await sendToWebiny(JSON.stringify(data));
        }

        rowsToProcess = []; // attempts at limiting number of concurrent requests
        request.resume(); // attempts at limiting number of concurrent requests
      }
});



// send
function sendToWebiny(data) {
    q++;
    // graphql endpoint and token here
    const options = {
        hostname: 'd253he7xobk0g4.cloudfront.net', // omit http ...
        path: '/cms/manage/en-US', // path/args after url
        port: 443,
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        Authorization: 'a586fcfac6e9b19981350c56166d969494fa11db10ecb314', // token
        'User-Agent': 'Node',
        },
    };

    const req = https.request(options, (res) => {
    let data = '';
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', (d) => {
        data += d;
    });
    res.on('end', () => { // print return
        console.log(JSON.parse(data).data);
    });
    });

    // error handling
    req.on('error', (error) => {
    console.error(error);
    rowFailedCount++;
    console.log(rowFailedCount);
    });

    req.write(data);
    req.end();
    q--;
}
