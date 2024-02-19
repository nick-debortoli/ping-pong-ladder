import { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { HeadToHead } from '../../../Types/dataTypes';
import * as d3 from 'd3';
import './H2HWinsCircle.scss';
import { vminToPixels } from '../../../Utils/stringUtils';
import { debounce } from 'lodash';

interface H2HWinsCircleProps {
    headToHead: HeadToHead | null;
    hasBothPlayers: boolean;
}

interface PieWinsData {
    wins: number;
    isLeft: boolean;
}

const drawPieChart = (winsData: PieWinsData[], svgRef: SVGSVGElement, size: number): void => {
    const dims = { height: size, width: size, radius: size / 2 };
    const cent = {
        x: dims.width / 2 + 5,
        y: dims.height / 2 + 5,
    };

    const svg = d3
        .select(svgRef)
        .attr('width', dims.width + 10)
        .attr('height', dims.height + 10);
    const graph = svg.append('g').attr('transform', `translate(${cent.x}, ${cent.y})`);

    const pie = d3
        .pie()
        .sort(null)
        .value((d) => d.wins)
        .startAngle((90 * Math.PI) / 180)
        .endAngle((450 * Math.PI) / 180);

    const arcPath = d3
        .arc()
        .outerRadius(dims.radius)
        .innerRadius(dims.radius - 10);

    const update = (data: PieWinsData[]): void => {
        const totalWins = data[0].wins + data[1].wins;
        const isWinnerLeft = data[0].wins >= data[1].wins;
        if (isWinnerLeft) {
            const loserPct = data[1].wins / totalWins;
            const loserArcLength = 360 * loserPct * (Math.PI / 180);
            pie.startAngle((90 * Math.PI) / 180 + loserArcLength / 2).endAngle(
                (450 * Math.PI) / 180 + loserArcLength / 2,
            );
        } else {
            const loserPct = data[0].wins / totalWins;
            const loserArcLength = 360 * loserPct * (Math.PI / 180);
            pie.startAngle((270 * Math.PI) / 180 + loserArcLength / 2).endAngle(
                (-90 * Math.PI) / 180 + loserArcLength / 2,
            );
        }
        const paths = graph.selectAll('.arc').data(pie(data));

        paths
            .enter()
            .append('path')
            .attr('class', 'arc')
            .attr('d', arcPath)
            .attr('fill', (d) => (isWinnerLeft === d.data.isLeft ? '#ff6f00' : 'white'))
            .transition()
            .duration(1000)
            .attrTween('d', arcTweenEnter);
    };

    const arcTweenEnter = (d) => {
        const i = d3.interpolate(d.endAngle, d.startAngle);
        return function (t) {
            d.startAngle = i(t);
            return arcPath(d);
        };
    };

    update(winsData);
};

const H2HWinsCircle: React.FC<H2HWinsCircleProps> = ({ headToHead, hasBothPlayers }) => {
    const [debouncedText, setDebouncedText] = useState<ReactElement | string>('');
    const pieChartRef = useRef<SVGSVGElement | null>(null);
    const resizing = useRef<boolean>(false);
    const textToShow: ReactElement | string = useMemo(() => {
        if (hasBothPlayers) {
            if (headToHead) {
                return (
                    <>
                        <span>VS</span>
                        <span>Wins</span>
                    </>
                );
            } else {
                return 'No Matches';
            }
        }
        return '';
    }, [hasBothPlayers, headToHead]);

    useEffect(() => {
        const redraw = () => {
            if (headToHead && pieChartRef.current) {
                if (!resizing.current) {
                    const size = vminToPixels(30);
                    const winsData: PieWinsData[] = [
                        { wins: headToHead.wins, isLeft: true },
                        { wins: headToHead.losses, isLeft: false },
                    ];
                    d3.select(pieChartRef.current).selectAll('*').remove();
                    drawPieChart(winsData, pieChartRef.current, size);
                }
                resizing.current = false;
            }
        };

        const debouncedRedraw = debounce(redraw, 300);

        window.addEventListener('resize', () => {
            resizing.current = true;
            debouncedRedraw();
        });
        redraw();

        return () => {
            window.removeEventListener('resize', debouncedRedraw);
            d3.select('#h2h-pie-chart').selectAll('*').remove();
        };
    }, [headToHead]);

    useEffect(() => {
        const redraw = () => {
            if (headToHead && pieChartRef.current) {
                d3.select(pieChartRef.current).selectAll('*').remove();

                const size = vminToPixels(30);
                const winsData: PieWinsData[] = [
                    { wins: headToHead.wins, isLeft: true },
                    { wins: headToHead.losses, isLeft: false },
                ];
                drawPieChart(winsData, pieChartRef.current, size);
            }
        };

        window.addEventListener('resize', redraw);
        redraw();

        return () => {
            window.removeEventListener('resize', redraw);
            // Remove existing SVG elements when the component unmounts
            d3.select(pieChartRef.current).selectAll('*').remove();
        };
    }, [headToHead]);

    useEffect(() => {
        if (debouncedText === '' && textToShow !== '') {
            const handler = setTimeout(() => {
                setDebouncedText(textToShow);
            }, 100);

            return () => clearTimeout(handler);
        } else {
            setDebouncedText(textToShow);
        }
    }, [textToShow, debouncedText]);

    return (
        <div className="h2h-wins-circle-container">
            {headToHead && (
                <>
                    <div className="left wins-count">{headToHead.wins}</div>
                    <div className="right wins-count">{headToHead.losses}</div>
                </>
            )}
            <svg id="h2h-pie-chart" ref={pieChartRef} />

            <div className="h2h-wins-circle">
                <span className={`center-label ${!headToHead && !hasBothPlayers && 'no-matches'}`}>
                    {debouncedText}
                </span>
            </div>
        </div>
    );
};

export default H2HWinsCircle;
