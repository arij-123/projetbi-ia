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
    # 2. Top Cities Analysis
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
    # 3. Top Doctors
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
    # 4. Rating Categories (Pie Chart)
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
    # 5. City Rating Analysis (Bar Chart)
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
    print("   - top_cities.png")
    print("   - top_doctors.png")
    print("   - rating_categories.png")
    print("   - city_rating.png")

if __name__ == "__main__":
    run_doctors_eda("doctors_export.csv")