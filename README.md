Data Entry
https://feedlot-chain-starter-cloud-1.onrender.com/

Event Viewer
https://bhbd1986.github.io/feedlot-chain-starter-cloud/

View the raw block chain (ledger)
https://feedlot-chain-starter-cloud-1.onrender.com/api/events

Data Input Examples
GROUP 1 — FEEDLOT
Role: FEEDLOT
Group PIN: 4312
Event type (use for both tags): ANIMAL_REGISTERED
Tag A: 124000111111111
Payload (paste exactly):
{"lot":"L-2026-CLASS","source":"AuctionX","arrivalDate":"2026-01-22"}
Tag B: 124000222222222
Payload:
{"lot":"L-2026-CLASS","source":"AuctionX","arrivalDate":"2026-01-22"}
________________________________________
GROUP 2 — SCALE
Role: SCALE
Group PIN: 7721
Event type: WEIGH_IN
Tag A: 124000111111111
Payload:
{"weightKg":362.5,"scaleTicket":"ST-1001"}
Tag B: 124000222222222
Payload:
{"weightKg":371.2,"scaleTicket":"ST-1002"}
________________________________________
GROUP 3 — VET
Role: VET
Group PIN: 9055
Event type: TREATMENT_ADMINISTERED
Tag A: 124000111111111
Payload:
{"drug":"Draxxin","doseMl":2.5,"withdrawalDays":18}
Tag B: 124000222222222
Payload:
{"drug":"Oxytet","doseMl":10,"withdrawalDays":28}
________________________________________
GROUP 4 — NUTRITION
Role: NUTRITION
Group PIN: 2468
Event type: RATION_ASSIGNED
Tag A: 124000111111111
Payload:
{"ration":"Grower-1","kgAsFedPerHead":9.0}
Tag B: 124000222222222
Payload:
{"ration":"Grower-1","kgAsFedPerHead":9.2}
________________________________________
GROUP 5 — TRUCK
Role: TRUCK
Group PIN: 1199
Event type: PICKUP_RECORDED
Tag A: 124000111111111
Payload:
{"trailerId":"TRL-88","driver":"J.Smith","destination":"Packer A"}
Tag B: 124000222222222
Payload:
{"trailerId":"TRL-88","driver":"J.Smith","destination":"Packer A"}
________________________________________
GROUP 6 — PACKER
Role: PACKER
Group PIN: 6604
Event type: RECEIVED_AT_PACKER
Tag A: 124000111111111
Payload:
{"plantId":"PLANT-3","receivedCondition":"Normal"}
Tag B: 124000222222222
Payload:
{"plantId":"PLANT-3","receivedCondition":"Normal"}

