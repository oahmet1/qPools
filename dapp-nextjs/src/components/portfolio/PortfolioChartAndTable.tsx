import React, {useEffect, useState} from "react";
import {PieChart, Pie, Cell} from "recharts";
import {AllocData, IQPool, useQPoolUserTool} from "../../contexts/QPoolsProvider";
import ExistingPortfolioTable from "../tables/ExistingPortfolioTable";

export default function PortfolioChartAndTable(props: any) {

    const qPoolContext: IQPool = useQPoolUserTool();

    const COLORS = [
        // "#2196f3",
        // "#f44336",
        // "#00C49F",
        // "#ffeb3b",
        // "#9c27b0",
        "#0c4a6e",
        "#831843",
        "#fbcfe8",
        "#bae6fd",
        "#94a3b8",
        "#fafafa",
        "#0369a1",
    ];
    const RADIAN = Math.PI / 180;

    const renderCustomizedLabel = ({cx, cy, midAngle, innerRadius, outerRadius, percent, index}: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.4; // 1.05;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return (

            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {
                    percent ? `${(percent * 100).toFixed(0)}%` : null
                }
            </text>

        );
    };

    const [pieChartData, setPieChartData] = useState([
        {name: "Group A", value: 400, apy_24h: 0.},
        {name: "Group B", value: 300, apy_24h: 0.},
        {name: "Group C", value: 300, apy_24h: 0.},
        {name: "Group D", value: 200, apy_24h: 0.}
    ])

    const [ratios, setRatios] = useState<AllocData[] | null>(null);

    const [totalAmountInUsdc, setTotalAmountInUsdc] = useState<number>(0.);
    useEffect(() => {
        if (props.totalAmountInUsdc) {
            console.log("Defined!", props.totalAmountInUsdc);
            setTotalAmountInUsdc(props.totalAmountInUsdc);
        } else {
            console.log("Undefined!", props.totalAmountInUsdc);
        }
    }, [props.totalAmountInUsdc]);

    // Maybe set loading until we are able to read the serpius API
    useEffect(() => {
        setRatios((_: AllocData[] | null) => {
            return qPoolContext.portfolioRatios!;
        });
    }, [qPoolContext.portfolioRatios]);

    useEffect(() => {
        if (!ratios) return;
        console.log("Here is in the variable:")
        console.log(JSON.stringify(ratios))

        // Sum is a
        let sum = ratios.reduce((sum: number, current: AllocData) => sum + current.weight, 0);
        setPieChartData((_: any) => {
                return ratios.map((current: AllocData) => {
                    return {
                        name: current.protocol + " " + current.lp,
                        value: ((100 * current.weight) / sum),
                        apy_24h: current.apy_24h
                    }
                });
            }
        )

    }, [ratios]);

    const singleRow = (row: any, index: number) => {

        let color = COLORS[index % COLORS.length];

        console.log("Value and total amount in usdc are: ");
        console.log(row.value);
        console.log(totalAmountInUsdc);
        console.log("APY is: ", row);
        console.log("row.apy_24h is: ", row.apy_24h);

        let style = {backgroundColor: color};

        return (
            <tr>
                <td className="px-2 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="ml-4">
                            <div
                                className={"w-4 h-4 rounded-xl"}
                                style={style}
                            >{}</div>
                        </div>
                    </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm">
                        {row.name}
                    </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm">
                        {row.value}%
                    </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm">
                        ${(0.01 * row.value * totalAmountInUsdc).toFixed(2)}
                    </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm">
                        {(row.apy_24h).toFixed(1)}%
                    </div>
                </td>
            </tr>
        )
    }

    // TODO: Maybe remove the labelled lines alltogether
    return (
        <>
            {/*-ml-14*/}
            <div className={"flex mt-0"}>
                <PieChart width={200} height={200}>
                    <Pie stroke="none"
                         data={pieChartData}
                         cx="50%"
                         cy="50%"
                         labelLine={false}
                         isAnimationActive={false} // this line is needed in order to see the labels. https://github.com/recharts/recharts/issues/929
                         label={renderCustomizedLabel}
                         outerRadius={100}
                         // fill="#8884d8"
                         dataKey="value"
                    >
                        {pieChartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}/>
                        ))}
                    </Pie>
                </PieChart>
            </div>

            <div className="flex flex-col mt-0 text-gray-300 md:pl-10">
                {/*lg:-mx-8*/}
                {/*sm:-mx-6*/}
                {/*<div className="-my-2 overflow-x-auto">*/}
                {/*    /!*sm:px-6 lg:px-8*!/*/}
                {/*    <div className="py-2 align-middle inline-block min-w-full">*/}
                {/*        <div className="overflow-hidden border-b border-gray-200 ">*/}
                {/*            <table className="min-w-full divide-y divide-gray-200">*/}
                {/*                <thead className="">*/}
                {/*                <tr>*/}
                {/*                    <th scope="col"*/}
                {/*                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">*/}
                {/*                    </th>*/}
                {/*                    <th scope="col"*/}
                {/*                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset*/}
                {/*                    </th>*/}
                {/*                    <th scope="col"*/}
                {/*                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation*/}
                {/*                    </th>*/}
                {/*                    <th scope="col"*/}
                {/*                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount*/}
                {/*                    </th>*/}
                {/*                    <th scope="col"*/}
                {/*                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">24h APY*/}
                {/*                    </th>*/}
                {/*                </tr>*/}
                {/*                </thead>*/}
                {/*                <tbody className="divide-y divide-gray-200">*/}
                {/*                {pieChartData.map((x, index) => {*/}
                {/*                    return (*/}
                {/*                        <>*/}
                {/*                            {singleRow(x, index)}*/}
                {/*                        </>*/}
                {/*                    )*/}
                {/*                })}*/}
                {/*                </tbody>*/}
                {/*            </table>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}
                {/*
                    Only show this Portfolio if the wallet is connected ...
                */}
                <ExistingPortfolioTable />
            </div>
        </>
    );
}
