# eda_doctors.py
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os

def run_doctors_eda(file_path="data/doctors_export.csv"):
    """
    Performs Advanced Exploratory Data Analysis on the doctors dataset.
    """
    # Créer le dossier data s'il n'existe pas
    os.makedirs("data", exist_ok=True)
    
    # Charger le dataset
    df = pd.read_csv(file_path)
    
    print("=" * 80)
    print("📊 ADVANCED EDA - DOCTORS DATASET")
    print("=" * 80)
    
    print("\n--- Dataset Shape ---")
    print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")
    
    # Nettoyer les données
    df['avg_rating'] = pd.to_numeric(df['avg_rating'], errors='coerce').fillna(0)
    df['rating_count'] = pd.to_numeric(df['rating_count'], errors='coerce').fillna(0)
    
    # ============================================
    # 1. Distribution des notes (Target Analysis)
    # ============================================
    plt.figure(figsize=(10, 6))
    df['avg_rating'].hist(bins=20, color='skyblue', edgecolor='black', alpha=0.7)
    plt.axvline(df['avg_rating'].mean(), color='red', linestyle='--', linewidth=2, 
                label=f'Moyenne: {df["avg_rating"].mean():.2f}')
    plt.title('Distribution des notes des médecins', fontsize=14)
    plt.xlabel('Note moyenne', fontsize=12)
    plt.ylabel('Nombre de médecins', fontsize=12)
    plt.legend()
    plt.savefig('data/rating_distribution.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved: data/rating_distribution.png")
    
    # ============================================
    # 2. Categorical Analysis: Impact sur les notes (par ville)
    # ============================================
    categorical_features = ['city', 'specialty']
    
    fig, axes = plt.subplots(1, 2, figsize=(15, 6))
    axes = axes.flatten()
    
    for i, feature in enumerate(categorical_features):
        if feature in df.columns:
            # Top 10 villes pour la lisibilité
            if feature == 'city':
                top_cities = df['city'].value_counts().head(10).index
                df_filtered = df[df['city'].isin(top_cities)]
            else:
                df_filtered = df
            
            sns.boxplot(x=feature, y='avg_rating', data=df_filtered, ax=axes[i], palette='Set2')
            axes[i].set_title(f'Distribution des notes par {feature}', fontsize=12)
            axes[i].set_xlabel(feature, fontsize=10)
            axes[i].set_ylabel('Note moyenne', fontsize=10)
            axes[i].tick_params(axis='x', rotation=45)
    
    plt.tight_layout()
    plt.savefig('data/categorical_impact.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved: data/categorical_impact.png")
    
    # ============================================
    # 3. Numerical Analysis: Boxplots
    # ============================================
    numerical_features = ['avg_rating', 'rating_count']
    
    plt.figure(figsize=(12, 5))
    for i, feature in enumerate(numerical_features):
        plt.subplot(1, 2, i+1)
        sns.boxplot(y=df[feature], palette='Set2')
        plt.title(f'Distribution de {feature}', fontsize=12)
        plt.ylabel(feature, fontsize=10)
    
    plt.tight_layout()
    plt.savefig('data/numerical_boxplots.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved: data/numerical_boxplots.png")
    
    # ============================================
    # 4. Top Cities Analysis
    # ============================================
    plt.figure(figsize=(12, 6))
    city_counts = df['city'].value_counts().head(10)
    city_counts.plot(kind='bar', color='coral', edgecolor='black')
    plt.title('Top 10 villes par nombre de médecins', fontsize=14)
    plt.xlabel('Ville', fontsize=12)
    plt.ylabel('Nombre de médecins', fontsize=12)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('data/top_cities.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved: data/top_cities.png")
    
    # ============================================
    # 5. Top Doctors
    # ============================================
    plt.figure(figsize=(12, 6))
    top_doctors = df.nlargest(10, 'avg_rating')
    names = [f"{row['first_name']} {row['last_name']}"[:20] for _, row in top_doctors.iterrows()]
    ratings = top_doctors['avg_rating'].values
    
    colors = plt.cm.Greens(np.linspace(0.4, 0.9, len(names)))
    plt.barh(names, ratings, color=colors)
    plt.title('Top 10 meilleurs médecins', fontsize=14)
    plt.xlabel('Note moyenne', fontsize=12)
    plt.gca().invert_yaxis()
    plt.tight_layout()
    plt.savefig('data/top_doctors.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved: data/top_doctors.png")
    
    # ============================================
    # 6. Rating vs Reviews Scatter Plot
    # ============================================
    plt.figure(figsize=(10, 6))
    scatter = plt.scatter(df['rating_count'], df['avg_rating'], 
                         c=df['avg_rating'], cmap='viridis', alpha=0.6, s=50)
    plt.colorbar(scatter, label='Note moyenne')
    plt.title('Relation: Note vs Nombre d\'avis', fontsize=14)
    plt.xlabel('Nombre d\'avis', fontsize=12)
    plt.ylabel('Note moyenne', fontsize=12)
    plt.grid(True, alpha=0.3)
    plt.savefig('data/rating_vs_reviews.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved: data/rating_vs_reviews.png")
    
    # ============================================
    # 7. Rating Categories (Pie Chart)
    # ============================================
    bins = [0, 3, 3.5, 4, 4.5, 4.8, 5]
    labels = ['<3.0', '3.0-3.5', '3.5-4.0', '4.0-4.5', '4.5-4.8', '4.8-5.0']
    df['rating_category'] = pd.cut(df['avg_rating'], bins=bins, labels=labels)
    rating_dist = df['rating_category'].value_counts()
    
    plt.figure(figsize=(8, 8))
    plt.pie(rating_dist, labels=rating_dist.index, autopct='%1.1f%%', startangle=90,
            colors=plt.cm.Set3(np.linspace(0, 1, len(rating_dist))))
    plt.title('Répartition des catégories de notes', fontsize=14)
    plt.savefig('data/rating_categories.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved: data/rating_categories.png")
    
    # ============================================
    # 8. Correlation Heatmap
    # ============================================
    plt.figure(figsize=(8, 6))
    numeric_cols = ['avg_rating', 'rating_count']
    corr = df[numeric_cols].corr()
    sns.heatmap(corr, annot=True, cmap='coolwarm', fmt='.2f', linewidths=0.5, vmin=-1, vmax=1)
    plt.title('Matrice de corrélation', fontsize=14)
    plt.savefig('data/correlation_heatmap.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved: data/correlation_heatmap.png")
    
    # ============================================
    # 9. City Rating Analysis (Bar Chart)
    # ============================================
    plt.figure(figsize=(14, 6))
    city_rating = df.groupby('city')['avg_rating'].mean().sort_values(ascending=False).head(15)
    city_rating.plot(kind='bar', color='teal', edgecolor='black')
    plt.title('Note moyenne par ville (Top 15)', fontsize=14)
    plt.xlabel('Ville', fontsize=12)
    plt.ylabel('Note moyenne', fontsize=12)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('data/city_rating.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved: data/city_rating.png")
    
    # ============================================
    # 10. Reviews Distribution (Histogram)
    # ============================================
    plt.figure(figsize=(10, 6))
    df[df['rating_count'] < 100]['rating_count'].hist(bins=30, color='purple', alpha=0.7, edgecolor='black')
    plt.title('Distribution du nombre d\'avis (<100)', fontsize=14)
    plt.xlabel('Nombre d\'avis', fontsize=12)
    plt.ylabel('Nombre de médecins', fontsize=12)
    plt.grid(True, alpha=0.3)
    plt.savefig('data/reviews_distribution.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("✅ Saved: data/reviews_distribution.png")
    
    # ============================================
    # Statistics Summary
    # ============================================
    print("\n" + "=" * 80)
    print("📊 STATISTICS SUMMARY")
    print("=" * 80)
    
    print(f"\n📈 Rating Statistics:")
    print(f"   - Mean: {df['avg_rating'].mean():.2f}")
    print(f"   - Median: {df['avg_rating'].median():.2f}")
    print(f"   - Std: {df['avg_rating'].std():.2f}")
    print(f"   - Min: {df['avg_rating'].min():.2f}")
    print(f"   - Max: {df['avg_rating'].max():.2f}")
    
    print(f"\n📊 Reviews Statistics:")
    print(f"   - Total Reviews: {df['rating_count'].sum():.0f}")
    print(f"   - Mean Reviews: {df['rating_count'].mean():.0f}")
    print(f"   - Median Reviews: {df['rating_count'].median():.0f}")
    
    print(f"\n📍 Top 5 Cities by Doctor Count:")
    for city, count in df['city'].value_counts().head(5).items():
        print(f"   - {city}: {count} doctors")
    
    print(f"\n🏆 Best Doctor:")
    best = df.loc[df['avg_rating'].idxmax()]
    print(f"   - Dr. {best['first_name']} {best['last_name']}: {best['avg_rating']}⭐ ({best['rating_count']} reviews)")
    
    print("\n" + "=" * 80)
    print("✨ Advanced EDA completed!")
    print(f"📁 All plots saved in 'data/' directory")
    print("=" * 80)
    
    print("\n📁 Fichiers générés dans le dossier 'data/':")
    print("   - rating_distribution.png")
    print("   - categorical_impact.png")
    print("   - numerical_boxplots.png")
    print("   - top_cities.png")
    print("   - top_doctors.png")
    print("   - rating_vs_reviews.png")
    print("   - rating_categories.png")
    print("   - correlation_heatmap.png")
    print("   - city_rating.png")
    print("   - reviews_distribution.png")

if __name__ == "__main__":
    run_doctors_eda("doctors_export.csv")