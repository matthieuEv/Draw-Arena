# Frontend | Draw-Arena



# API Endpoints :
|ACTION |ENDPOINT |authorization |param |return |
|:---|:------------|:-------------|:-----|:------|
|GET|/api||||                                        #(To improve)
|
|
|GET|/api/concours||||                              #(To improve)
|GET|/api/concours/?id|logged|||                      #(To improve: US U2)
|GET|/api/concours/?id/status|president|||
|GET|/api/concours/?id/advancements|director||Suivre l’avancement (dépôts, notations, quotas)|
|POST|/api/concours|admin|TO DEFINE|TO DEFINE|
|POST|/api/concours/?id/depot|competitor|image, comment|status|
|POST|/api/concours/?id/president|admin|president_id|status|
|POST|/api/concours/?id/competitor|director|id||
|POST|/api/concours/?id/evaluator|director|id||
|DELETE|/api/concours/?id/competitor/?id|director|||
|DELETE|/api/concours/?id/evaluator/?id|director|||
|
|
|GET|/api/dessin/?id|logged||description, url|
|GET|/api/dessin|logged||random image|
|GET|/api/dessins/?nb|logged||return array of public images|
|POST|/api/dessin/?id/evaluator|president|id1, id2|status|
|POST|/api/dessin/?id/evaluate|evaluator|note|status|
|
|
|POST|/api/club|admin|club data|status|
|UPDATE|/api/club/?id|admin|modified data|status|
|DELETE|/api/club/?id|admin|none|status|
|GET|/api/club/?id/members|director|||
|POST|/api/club/?id/member|director|||
|UPDATE|/api/club/?id/member/?id|director|||
|DELETE|/api/club/?id/member/?id|director|||
|
|
|POST|/api/statistique|admin|annuelles, triennales|status|
|GET|/api/statistique/?..|logged|||                 #(To improve)
|
|
|POST|/api/user/login|all|Username,password|token|
|POST|/api/user/singin|all|...|token|
|GET|/api/user/profil|logged||status|                        #(To improve)
|GET|/api/user/dessins|logged||array of image/desc|
|UPDATE|/api/user/profil|logged|data to update|status|
|UPDATE|/api/user/profil/picture|logged|image|status|


||||||

