Data Entry
https://feedlot-chain-starter-cloud-1.onrender.com/

Event Viewer
https://bhbd1986.github.io/feedlot-chain-starter-cloud/

View the raw block chain (ledger)
https://feedlot-chain-starter-cloud-1.onrender.com/api/events

Data Input Examples
GROUP 1 — FEEDLOT
https://feedlot-chain-starter-cloud-1.onrender.com/
Role: FEEDLOT
Group PIN: 4312
Event type (use for all tags): ANIMAL_REGISTERED
Tag A: 124000111111111
Payload (paste exactly):
{"lot":"L-2026-CLASS","source":"AuctionX","truck":"pony_exp"}
Tag B: 124000222222222
Payload:
{"lot":"L-2026-CLASS","source":"AuctionX","truck":"pony_exp"}
Tag C: 124000333333333
Payload:
{"lot":"L-2026-CLASS","source":"AuctionX","truck":"pony_exp"}

 
GROUP 2 — TRUCK PICKUP AUCTION
https://feedlot-chain-starter-cloud-1.onrender.com/
Role: TRUCK
Group PIN: 1199
Event type: PICKUP_RECORDED
Tag A: 124000111111111
Payload:
{"carrier":"pony_exp","trailerId":"TRL-02","driver":"A.Grinde","pickup":" AuctionX "}
Tag B: 124000222222222
Payload:
{"carrier":"pony_exp","trailerId":"TRL-02","driver":" A.Grinde ","pickup":" AuctionX "}
 
GROUP 3 — TRUCK DELIVERY FEEDLOT
https://feedlot-chain-starter-cloud-1.onrender.com/
Role: TRUCK
Group PIN: 1199
Event type: DELIVERY_RECORDED
Tag A: 124000111111111
Payload:
{"carrier":"pony_exp","trailerId":"TRL-88","driver":" A.Grinde ","destination":" BAT_FEEDERS "}
Tag B: 124000222222222
Payload:
{"carrier":"pony_exp","trailerId":"TRL-88","driver":" A.Grinde ","destination":" BAT_FEEDERS "} 
GROUP 4 — FEEDLOT
https://feedlot-chain-starter-cloud-1.onrender.com/
Role: FEEDLOT
Group PIN: 4312
Event type (use for all tags): ARRIVAL_RECORDED
Tag A: 124000111111111
Payload (paste exactly):
{"type":"steer","truck":"pony_exp","pen":"BF_1913"}
Tag B: 124000222222222
Payload:
{" type ":" steer","truck":"pony_exp","pen":"BF_1913"}
Tag C: 124000333333333
Payload:
{" type ":" steer","truck":"pony_exp","pen":"BF_1913"}


 
GROUP 5 — SCALE IN
https://feedlot-chain-starter-cloud-1.onrender.com/
Role: SCALE
Group PIN: 7721
Event type: WEIGH_IN
Tag A: 124000111111111
Payload:
{"weightKg":362.5,"scaleTicket":"ST-1001"}
Tag B: 124000222222222
Payload:
{"weightKg":371.2,"scaleTicket":"ST-1002"}
Tag C: 124000333333333
Payload:
{"weightKg":367.2,"scaleTicket":"ST-1003"}
 
GROUP 6 — VET
https://feedlot-chain-starter-cloud-1.onrender.com/
Role: VET
Group PIN: 9055
Event type: TREATMENT_ADMINISTERED
Tag A: 124000111111111
Payload:
{"drug":"Draxxin","doseMl":2.5,"withdrawalDays":18}
Tag B: 124000222222222
Payload:
{"drug":"Oxytet","doseMl":10,"withdrawalDays":28}

 
GROUP 7 — NUTRITION
https://feedlot-chain-starter-cloud-1.onrender.com/
Role: NUTRITION
Group PIN: 2468
Event type: RATION_ASSIGNED
Tag A: 124000111111111
Payload:
{"ration":"Grower-1","kgAsFedPerHead":9.0}
Tag B: 124000222222222
Payload:
{"ration":"Grower-1","kgAsFedPerHead":9.2}

 
GROUP 8 — SCALE OUT
https://feedlot-chain-starter-cloud-1.onrender.com/
Role: SCALE
Group PIN: 7721
Event type: WEIGH_OUT
Tag A: 124000111111111
Payload:
{"weightKg":426.4,"scaleTicket":"ST-1001"}
Tag B: 124000222222222
Payload:
{"weightKg":465.3,"scaleTicket":"ST-1002"}
Tag C: 124000333333333
Payload:
{"weightKg":867.2,"scaleTicket":"ST-1003"}
***Call Pete at plant 3 and tell him “Chisos steero finito” >> 403-910-6767 ***


 
GROUP 9 — TRUCK PICKUP FEEDLOT
https://feedlot-chain-starter-cloud-1.onrender.com/
Role: TRUCK
Group PIN: 1199
Event type: PICKUP_RECORDED
Tag A: 124000111111111
Payload:
{"carrier":"pony_exp","trailerId":"TRL-88","driver":"Willey","pickup":"BAT_FEEDERS"}
Tag B: 124000222222222
Payload:
{"carrier":"pony_exp","trailerId":"TRL-88","driver":" Willey ","pickup":" BAT_FEEDERS "}

 
GROUP 10 — TRUCK DELIVERY PACKER
https://feedlot-chain-starter-cloud-1.onrender.com/
Role: TRUCK
Group PIN: 1199
Event type: DELIVERY_RECORDED
Tag A: 124000111111111
Payload:
{"trailerId":"TRL-88","driver":" Willey ","destination":" PLANT-3"}
Tag B: 124000222222222
Payload:
{"trailerId":"TRL-88","driver":" Willey ","destination":" PLANT-3"}
 
GROUP 11 — PACKER
https://feedlot-chain-starter-cloud-1.onrender.com/
Role: PACKER
Group PIN: 6604
Event type: RECEIVED_AT_PACKER
Tag A: 124000111111111
Payload:
{"plantId":"PLANT-3","receivedCondition":"Normal"}
Tag B: 124000222222222
Payload:
{"plantId":"PLANT-3","receivedCondition":"Normal"}
Tag C: 124000333333333
Payload:
{"plantId":"PLANT-3","receivedCondition":"Excellent"}

Payload:
{"plantId":"PLANT-3","receivedCondition":"Normal"}

