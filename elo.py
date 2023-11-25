import pandas as pd

def expected(A, B):
    """
    Calculate expected score of A in a match against B

    :param A: Elo rating for player A
    :param B: Elo rating for player B
    """
    return 1 / (1 + 10 ** ((B - A) / 400))

def elo(old, exp, score, k=32):
    """
    Calculate the new Elo rating for a player

    :param old: The previous Elo rating
    :param exp: The expected score for this match
    :param score: The actual score for this match
    :param k: The k-factor for Elo (default: 32)
    """
    return old + k * (score - exp)

def update_ratings(df, winner_id, loser_id):
    """
    Update leaderboard dataframe

    :param df: The leaderboard dataframe
    :param winner_id: The player_id for the winning player
    :param loser_id: The player_id for the losing player
    """
    winner_elo = df.loc[df['pid'] == winner_id, 'elo'].values[0]
    loser_elo = df.loc[df['pid'] == loser_id, 'elo'].values[0]

    df.loc[df['pid'] == winner_id, 'elo'] = elo(winner_elo, expected(winner_elo, loser_elo), 1)
    df.loc[df['pid'] == loser_id, 'elo'] = elo(loser_elo, expected(loser_elo, winner_elo), 0)
    df.loc[df['pid'] == winner_id, 'w'] = 1 + df.loc[df['pid'] == winner_id, 'w']
    df.loc[df['pid'] == loser_id, 'l'] = 1 + df.loc[df['pid'] == loser_id, 'l']
    df['rank'] = df['elo'].rank(method='max', ascending=False)
    return df.sort_values('rank')