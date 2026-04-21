"""
seed.py — Données initiales pour les 9 classes de maladies de peau
Run : python seed.py  (depuis la racine du projet)
"""

from backend.database import engine, SessionLocal
from backend.models import Base, Maladie, Soin, Produit, SoinProduit

Base.metadata.create_all(bind=engine)
db = SessionLocal()


# ══════════════════════════════════════════════════════════════════════════════
#  DONNÉES
# ══════════════════════════════════════════════════════════════════════════════

DATA = [

    # ── 1. Atopic Dermatitis ──────────────────────────────────────────────────
    {
        "maladie": "Atopic_Dermatitis",
        "description": "Maladie inflammatoire chronique causant démangeaisons et rougeurs.",
        "soins": [
            {
                "titre": "Hydratation intensive",
                "type": "traitement",
                "instructions": (
                    "Appliquer un émollient épais immédiatement après la douche (peau encore humide). "
                    "Répéter matin et soir, en insistant sur les plis du coude et des genoux."
                ),
                "produits": [
                    {
                        "nom": "Cérat de Galien",
                        "type": "crème",
                        "description": "Émollient très occlusif, idéal pour peau très sèche.",
                        "usage": "2x/jour sur peau humide après la douche.",
                    },
                    {
                        "nom": "Vaseline pure",
                        "type": "pommade",
                        "description": "Barrière occlusive protégeant les zones très sèches.",
                        "usage": "Appliquer en couche fine sur les zones de friction.",
                    },
                ],
            },
            {
                "titre": "Corticoïde topique",
                "type": "traitement",
                "instructions": (
                    "Appliquer une fine couche sur les plaques actives uniquement. "
                    "Ne pas dépasser 7 jours consécutifs sans avis médical."
                ),
                "produits": [
                    {
                        "nom": "Hydrocortisone 1%",
                        "type": "crème",
                        "description": "Corticoïde faible, adapté au visage et aux plis.",
                        "usage": "1x/jour sur les lésions actives.",
                    },
                ],
            },
            {
                "titre": "Bain apaisant",
                "type": "hygiène",
                "instructions": (
                    "Bain tiède (pas chaud) de 10 minutes max avec huile de bain. "
                    "Sécher en tamponnant sans frotter. Appliquer émollient aussitôt."
                ),
                "produits": [
                    {
                        "nom": "Huile de bain Mustela Stelatopia",
                        "type": "lotion",
                        "description": "Huile relipidante pour bain, apaise et hydrate.",
                        "usage": "Verser dans le bain tiède, 1x/jour.",
                    },
                ],
            },
        ],
    },

    # ── 2. Basal Cell Carcinoma ───────────────────────────────────────────────
    {
        "maladie": "Basal_Cell_Carcinoma",
        "description": "Cancer de la peau le plus fréquent, à croissance lente. Nécessite suivi médical.",
        "soins": [
            {
                "titre": "Protection solaire stricte",
                "type": "prévention",
                "instructions": (
                    "Appliquer SPF 50+ toutes les 2 heures en cas d'exposition. "
                    "Éviter le soleil entre 11h et 16h. Porter chapeau et vêtements couvrants."
                ),
                "produits": [
                    {
                        "nom": "Crème solaire SPF 50+",
                        "type": "crème",
                        "description": "Protection UVA/UVB très haute pour peaux à risque.",
                        "usage": "Toutes les 2h sur les zones exposées.",
                    },
                ],
            },
            {
                "titre": "Soin post-opératoire",
                "type": "traitement",
                "instructions": (
                    "Nettoyer la plaie 2x/jour avec sérum physiologique. "
                    "Appliquer pommade cicatrisante et recouvrir d'un pansement stérile."
                ),
                "produits": [
                    {
                        "nom": "Biafine émulsion",
                        "type": "pommade",
                        "description": "Favorise la cicatrisation des plaies superficielles.",
                        "usage": "Appliquer en couche épaisse sous pansement, 2x/jour.",
                    },
                    {
                        "nom": "Sérum physiologique stérile",
                        "type": "lotion",
                        "description": "Nettoyage doux de la plaie.",
                        "usage": "Rinçage avant chaque application de pommade.",
                    },
                ],
            },
        ],
    },

    # ── 3. Eczema ─────────────────────────────────────────────────────────────
    {
        "maladie": "Eczema",
        "description": "Inflammation cutanée chronique causant démangeaisons, rougeurs et vésicules.",
        "soins": [
            {
                "titre": "Crème émolliente quotidienne",
                "type": "traitement",
                "instructions": (
                    "Appliquer généreusement 2 à 3 fois par jour, même hors poussée. "
                    "Privilégier les formules sans parfum ni conservateur."
                ),
                "produits": [
                    {
                        "nom": "Dexeryl crème",
                        "type": "crème",
                        "description": "Émollient sans parfum, restaure la barrière cutanée.",
                        "usage": "2-3x/jour sur tout le corps.",
                    },
                    {
                        "nom": "Avène XeraCalm A.D",
                        "type": "crème",
                        "description": "Apaise les démangeaisons et répare la barrière.",
                        "usage": "Matin et soir sur les zones sèches.",
                    },
                ],
            },
            {
                "titre": "Hygiène douce",
                "type": "hygiène",
                "instructions": (
                    "Utiliser un pain surgras ou gel sans savon. Eau tiède uniquement. "
                    "Sécher en tamponnant. Éviter les textiles synthétiques."
                ),
                "produits": [
                    {
                        "nom": "Pain surgras Dove",
                        "type": "lotion",
                        "description": "Nettoyant doux sans savon pour peau sensible.",
                        "usage": "À chaque toilette, eau tiède.",
                    },
                ],
            },
        ],
    },

    # ── 4. Keratosis ─────────────────────────────────────────────────────────
    {
        "maladie": "Keratosis",
        "description": "Épaississement de la couche cornée de la peau, souvent bénin.",
        "soins": [
            {
                "titre": "Exfoliation kératolytique",
                "type": "traitement",
                "instructions": (
                    "Appliquer sur les zones épaissies après la douche. "
                    "Utiliser 3 à 4 fois par semaine, pas quotidiennement."
                ),
                "produits": [
                    {
                        "nom": "Acide salicylique 10%",
                        "type": "pommade",
                        "description": "Kératolytique puissant, ramollit les épaississements.",
                        "usage": "3-4x/semaine sur les zones kératosiques.",
                    },
                    {
                        "nom": "Urée 20% crème",
                        "type": "crème",
                        "description": "Hydratant et kératolytique doux.",
                        "usage": "1x/jour sur les zones sèches et épaissies.",
                    },
                ],
            },
            {
                "titre": "Protection solaire",
                "type": "prévention",
                "instructions": (
                    "Application quotidienne de SPF 50+ même par temps nuageux. "
                    "Indispensable pour prévenir l'évolution vers un carcinome."
                ),
                "produits": [
                    {
                        "nom": "Crème solaire SPF 50+",
                        "type": "crème",
                        "description": "Protection maximale UVA/UVB.",
                        "usage": "Chaque matin et toutes les 2h en extérieur.",
                    },
                ],
            },
        ],
    },

    # ── 5. Melanocytic Nevi ───────────────────────────────────────────────────
    {
        "maladie": "Melanocytic_Nevi",
        "description": "Grains de beauté bénins. La surveillance est le soin principal.",
        "soins": [
            {
                "titre": "Surveillance ABCDE",
                "type": "prévention",
                "instructions": (
                    "Photographier les nævus tous les 3 mois. "
                    "Consulter si : Asymétrie, Bords irréguliers, Couleur hétérogène, "
                    "Diamètre > 6mm, Évolution. Bilan dermatologique annuel obligatoire."
                ),
                "produits": [],
            },
            {
                "titre": "Protection solaire quotidienne",
                "type": "prévention",
                "instructions": (
                    "Appliquer SPF 50+ chaque matin sur toutes les zones exposées. "
                    "Renouveler toutes les 2h. Éviter les UV artificiels."
                ),
                "produits": [
                    {
                        "nom": "Crème solaire SPF 50+ teintée",
                        "type": "crème",
                        "description": "Protection anti-UV complète, adaptée au quotidien.",
                        "usage": "Chaque matin, renouvelé en cas d'exposition.",
                    },
                ],
            },
        ],
    },

    # ── 6. Melanoma ───────────────────────────────────────────────────────────
    {
        "maladie": "Melanoma",
        "description": "Cancer de la peau le plus dangereux. Suivi oncologique indispensable.",
        "soins": [
            {
                "titre": "Soin post-chirurgical",
                "type": "traitement",
                "instructions": (
                    "Nettoyer la cicatrice 2x/jour avec sérum physiologique. "
                    "Appliquer gel cicatrisant après cicatrisation complète (J15+). "
                    "Protéger du soleil 12 mois minimum."
                ),
                "produits": [
                    {
                        "nom": "Cicaplast Baume B5",
                        "type": "pommade",
                        "description": "Répare et protège la peau fragilisée post-opératoire.",
                        "usage": "2x/jour sur cicatrice après J15.",
                    },
                    {
                        "nom": "Contractubex gel",
                        "type": "gel",
                        "description": "Réduit les cicatrices hypertrophiques.",
                        "usage": "2x/jour en massage doux pendant 3 mois.",
                    },
                ],
            },
            {
                "titre": "Protection solaire totale",
                "type": "prévention",
                "instructions": (
                    "SPF 50+ obligatoire tous les jours, y compris en hiver. "
                    "Aucune exposition directe sans protection textile et crème."
                ),
                "produits": [
                    {
                        "nom": "Crème solaire SPF 50+",
                        "type": "crème",
                        "description": "Protection maximale pour peaux post-melanoma.",
                        "usage": "Chaque matin et toutes les 2h.",
                    },
                ],
            },
        ],
    },

    # ── 7. Psoriasis ──────────────────────────────────────────────────────────
    {
        "maladie": "Psoriasis",
        "description": "Maladie auto-immune chronique formant des plaques épaisses et squameuses.",
        "soins": [
            {
                "titre": "Traitement kératolytique des plaques",
                "type": "traitement",
                "instructions": (
                    "Appliquer sur les plaques squameuses le soir. "
                    "Laisser agir toute la nuit, recouvrir d'un film plastique. "
                    "Rincer le matin."
                ),
                "produits": [
                    {
                        "nom": "Daivobet gel",
                        "type": "gel",
                        "description": "Calcipotriol + bétaméthasone, kératolytique + anti-inflammatoire.",
                        "usage": "1x/jour sur les plaques, max 4 semaines.",
                    },
                    {
                        "nom": "Acide salicylique 10% pommade",
                        "type": "pommade",
                        "description": "Ramollit et élimine les squames épaisses.",
                        "usage": "Soir sur les plaques, rincer le matin.",
                    },
                ],
            },
            {
                "titre": "Hydratation corporelle",
                "type": "traitement",
                "instructions": (
                    "Appliquer crème hydratante sur tout le corps après la douche. "
                    "Insister sur les coudes, genoux et cuir chevelu. "
                    "Éviter les douches trop chaudes (max 37°C)."
                ),
                "produits": [
                    {
                        "nom": "Urée 10% lait corporel",
                        "type": "lotion",
                        "description": "Hydratation profonde et effet kératolytique doux.",
                        "usage": "1x/jour sur tout le corps.",
                    },
                    {
                        "nom": "Xamiol gel cuir chevelu",
                        "type": "gel",
                        "description": "Spécifique psoriasis du cuir chevelu.",
                        "usage": "1x/jour sur cuir chevelu humide.",
                    },
                ],
            },
            {
                "titre": "Bain thérapeutique",
                "type": "hygiène",
                "instructions": (
                    "Bain avec huile de bain 2-3x/semaine. "
                    "Eau tiède, 15 minutes max. "
                    "Sécher en tamponnant, appliquer crème immédiatement."
                ),
                "produits": [
                    {
                        "nom": "Huile de bain Balnetar",
                        "type": "lotion",
                        "description": "Goudron de houille, réduit l'inflammation psoriasique.",
                        "usage": "2-3x/semaine dans le bain.",
                    },
                ],
            },
        ],
    },

    # ── 8. Tinea Ringworm ─────────────────────────────────────────────────────
    {
        "maladie": "Tinea_Ringworm",
        "description": "Infection fongique (dermatophytose) formant des anneaux sur la peau.",
        "soins": [
            {
                "titre": "Antifongique topique",
                "type": "traitement",
                "instructions": (
                    "Appliquer sur la lésion ET 2 cm autour. "
                    "Continuer 2 semaines après disparition visible pour éviter la rechute."
                ),
                "produits": [
                    {
                        "nom": "Lamisil 1% crème",
                        "type": "crème",
                        "description": "Terbinafine, antifongique de référence.",
                        "usage": "1-2x/jour pendant 2 à 4 semaines.",
                    },
                    {
                        "nom": "Clotrimazole 1% crème",
                        "type": "crème",
                        "description": "Antifongique large spectre, bien toléré.",
                        "usage": "2x/jour pendant 3-4 semaines.",
                    },
                ],
            },
            {
                "titre": "Hygiène préventive",
                "type": "hygiène",
                "instructions": (
                    "Changer de sous-vêtements et chaussettes quotidiennement. "
                    "Ne pas partager serviettes. Laver les textiles à 60°C."
                ),
                "produits": [
                    {
                        "nom": "Poudre antifongique miconazole",
                        "type": "pommade",
                        "description": "Prévient la macération et la réinfection.",
                        "usage": "Saupoudrer dans les chaussures et entre les orteils.",
                    },
                ],
            },
        ],
    },

    # ── 9. Warts Molluscum ────────────────────────────────────────────────────
    {
        "maladie": "Warts_Molluscum",
        "description": "Infections virales cutanées bénignes (verrues et molluscum contagiosum).",
        "soins": [
            {
                "titre": "Traitement kératolytique des verrues",
                "type": "traitement",
                "instructions": (
                    "Tremper la zone dans l'eau tiède 5 minutes. "
                    "Limer la surface avec une lime à usage unique. "
                    "Appliquer et recouvrir d'un pansement occlusif chaque soir "
                    "pendant 8 à 12 semaines."
                ),
                "produits": [
                    {
                        "nom": "Duofilm solution",
                        "type": "gel",
                        "description": "Acide salicylique + lactique, kératolytique pour verrues.",
                        "usage": "1x/jour le soir sous pansement occlusif.",
                    },
                    {
                        "nom": "Verrutop solution",
                        "type": "lotion",
                        "description": "Acide nitrique, détruit le tissu viral.",
                        "usage": "1 goutte sur la verrue, 1x/semaine.",
                    },
                ],
            },
            {
                "titre": "Traitement molluscum",
                "type": "traitement",
                "instructions": (
                    "Appliquer crème anesthésiante 1h avant curetage médical. "
                    "Entre les séances : crème apaisante pour réduire l'irritation."
                ),
                "produits": [
                    {
                        "nom": "Emla crème",
                        "type": "crème",
                        "description": "Lidocaïne + prilocaïne, anesthésique topique avant curetage.",
                        "usage": "1h avant le geste médical sous film occlusif.",
                    },
                    {
                        "nom": "Imiquimod 5% crème",
                        "type": "crème",
                        "description": "Immunomodulateur stimulant la réponse antivirale locale.",
                        "usage": "3x/semaine le soir pendant 4 à 16 semaines.",
                    },
                ],
            },
            {
                "titre": "Hygiène anti-contagion",
                "type": "hygiène",
                "instructions": (
                    "Ne pas gratter ni percer les lésions. "
                    "Couvrir les verrues avec un pansement à la piscine. "
                    "Ne pas partager serviettes ni chaussures."
                ),
                "produits": [],
            },
        ],
    },
]


# ══════════════════════════════════════════════════════════════════════════════
#  INSERTION
# ══════════════════════════════════════════════════════════════════════════════

def run_seed():
    print("Démarrage du seed...\n")

    for entry in DATA:

        # 1. Maladie
        maladie = db.query(Maladie).filter(Maladie.nom == entry["maladie"]).first()
        if not maladie:
            maladie = Maladie(nom=entry["maladie"], description=entry["description"])
            db.add(maladie)
            db.flush()
            print(f"[+] Maladie : {maladie.nom}")
        else:
            print(f"[~] Déjà existante : {maladie.nom}")

        for soin_data in entry["soins"]:

            # 2. Soin
            soin = Soin(
                maladie_id=maladie.id,
                titre=soin_data["titre"],
                type=soin_data["type"],
                instructions=soin_data["instructions"],
            )
            db.add(soin)
            db.flush()
            print(f"    [+] Soin : {soin.titre}")

            for produit_data in soin_data["produits"]:

                # 3. Produit — pas de doublon par nom
                produit = db.query(Produit).filter(
                    Produit.nom == produit_data["nom"]
                ).first()

                if not produit:
                    produit = Produit(
                        nom=produit_data["nom"],
                        type=produit_data["type"],
                        description=produit_data["description"],
                        usage_conseil=produit_data["usage"],
                    )
                    db.add(produit)
                    db.flush()
                    print(f"        [+] Produit : {produit.nom}")

                # 4. Liaison soin <-> produit
                lien = SoinProduit(soin_id=soin.id, produit_id=produit.id)
                db.add(lien)

    db.commit()
    print("\nSeed terminé avec succès !")


if __name__ == "__main__":
    run_seed()