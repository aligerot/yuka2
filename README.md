Petite appli qui permet de scan un code barre, puis de récupérer le produit depuis openFoodFact s'il existe dans leur base.

utilisation:
à l'ouverture de l'application, cliquer sur l'icone en bas à droite qui ouvre votre caméra (appuyer sur autoriser si une popup apparait)
une fois que votre camera apparait à l'écran, placer un code barre devant pour le scanner.
si le produit scanné est dans les données d'openfoodfact,petit son, et le détail du produit apparaitra et sera stocké.
s'il n'est pas dans la base de donnée, un message d'erreur apparaitra 4 secondes.

l'historique des produits scanné avec succès apparaitra sur la page d'accueil dans l'ordre dans lesquels vous les avez scanné.
cliquer sur le produit dans la page d'accueil renvoie vers la page de détail.

un problème?
il arrive que l'api d'openfoodfact soit indisponible pendant 1 ou 2 minutes.
pour vérifier si le problème vient de là , vous pouvez aller sur ce lien :
https://world.openfoodfacts.org/api/v0/product/3038350345004.json

si le json charge en 2 secondes, l'api fonctionne, si le chargement semble long(10 secondes) ou que la page tombe en erreur, l'API est down.
