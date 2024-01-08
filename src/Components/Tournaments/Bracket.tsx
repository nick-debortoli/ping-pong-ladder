import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { Office, Player, Tournament } from '../../Types/dataTypes';
import { usePlayers } from '../../Contexts/PlayersContext';
import { calculateBracket } from '../../Utils/tournamentUtils';

interface BracketProps {
    tournament: Tournament;
    activeOffice: Office;
}

const Bracket: React.FC<BracketProps> = ({ tournament, activeOffice }) => {
    const bracketRef = useRef(null);

    const { getPlayerById } = usePlayers();

    const createBracket = (players: Player[]): void => {
        const bracketData = calculateBracket(players);
        const matchHeight = 50;
        const roundWidth = 200;
        const svgWidth = roundWidth * Math.ceil(Math.log2(players.length));
        const svgHeight = matchHeight * players.length;

        const svg = d3
            .select(bracketRef.current)
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight);

        // Drawing each match
        bracketData.forEach((match, index) => {
            const { player1, player2 } = match;
            const group = svg.append('g').attr('transform', `translate(0, ${index * matchHeight})`);

            // Line for the match
            group
                .append('line')
                .attr('x1', 0)
                .attr('y1', matchHeight / 2)
                .attr('x2', roundWidth)
                .attr('y2', matchHeight / 2)
                .attr('stroke', 'black');

            // Text for Player 1
            group
                .append('text')
                .attr('x', 10)
                .attr('y', matchHeight / 3)
                .attr('fill', 'white')
                .text(`${player1?.seed} ${player1?.player.firstName} ${player1?.player.lastName}`);

            // Text for Player 2, if not a bye
            if (match.player2) {
                group
                    .append('text')
                    .attr('fill', 'white')
                    .attr('x', 10)
                    .attr('y', (2 * matchHeight) / 3)
                    .text(
                        player2
                            ? `${player2.seed} ${player2.player.firstName} ${player2.player.lastName}`
                            : 'Bye',
                    );
            }
        });
    };

    useEffect(() => {
        const players = tournament.seeds[activeOffice]
            .map((playerId) => getPlayerById(playerId))
            .filter((player): player is Player => player !== null);

        if (bracketRef.current) {
            d3.select(bracketRef.current).selectAll('*').remove();
            createBracket(players);
        }
    }, [tournament, activeOffice, getPlayerById]);

    return <div ref={bracketRef}></div>;
};

export default Bracket;
