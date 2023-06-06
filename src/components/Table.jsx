import { useEffect, useMemo, useState } from "react";
import DerivAPIBasic from "https://cdn.skypack.dev/@deriv/deriv-api/dist/DerivAPIBasic";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { useSelector, useDispatch } from "react-redux";
import {
    setMarketIndices,
    filterMarketIndices,
    updateMarketPrice,
    updateHistoryPrice,
} from "../store/marketSlice";

import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/mira/theme.css";

const app_id = 1089;
const connection = new WebSocket(
    `wss://ws.binaryws.com/websockets/v3?app_id=${app_id}`
);
const api = new DerivAPIBasic({ connection });

/**
   * React main component of server content.
   */
const Table = () => {

    // States
    // -----------------------------------------------------------------------------------------------
    const filteredData = useSelector((state) => state.market.filteredData);
    const data = useMemo(() => [...filteredData], [filteredData]);
    const [activeIndex, setActiveIndex] = useState(0);

    const [sorting, setSorting] = useState([]);
    const marketData = useSelector((state) => state.market.marketData);
    const selectedSubMarket = useSelector(
        (state) => state.market.selectedSubMarket
    );

    // Helper Functions
    // -----------------------------------------------------------------------------------------------
    const dispatch = useDispatch();


    const columnHelper = createColumnHelper();

    const columns = [
        columnHelper.accessor("display_name", {
            header: () => "Name",
            cell: (info) => info.getValue(),
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor("symbol", {
            header: () => "Symbol",
            cell: (info) => info.renderValue(),
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor("lastPrice", {
            header: () => "Current Price",
            cell: (info) => info.renderValue(),
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor("histHighPrice", {
            header: () => "24h High",
            cell: (info) => info.renderValue(),
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor("histLowPrice", {
            header: () => "24h Low",
            cell: (info) => info.renderValue(),
            footer: (info) => info.column.id,
        }),
        columnHelper.accessor("histChange", {
            header: () => "24h Change",
            cell: (info) => info.renderValue(),
            footer: (info) => info.column.id,
        }),
    ];
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });
    const ticks_history_request = {
        ticks_history: "R_50",
        end: "latest",
        style: "candles",
        req_id: 1,
        granularity: 86400,
    };

    // Event Handlers
    // -----------------------------------------------------------------------------------------------
    const websocketResponse = async (res) => {
        const { active_symbols, error, msg_type } = JSON.parse(res.data);

        if (error !== undefined) {
            console.log("Error: ", error?.message);
            connection.removeEventListener("message", websocketResponse, false);
            await api.disconnect();
        }

        if (msg_type === "active_symbols") {
            dispatch(setMarketIndices(active_symbols));
        }

        connection.removeEventListener("message", websocketResponse, false);
    };
    const tickResponse = async (res) => {
        const { msg_type, error, tick } = JSON.parse(res.data);

        if (error !== undefined) {
            console.log("Error: ", error?.message);
            // connection.removeEventListener('message', tickResponse, false);
            // await api.disconnect();
        }

        if (msg_type === "tick") {
            if (tick !== undefined) dispatch(updateMarketPrice(tick));
        }
    };

    const ticksHistoryResponse = async (res) => {
        const { msg_type, error, candles, echo_req } = JSON.parse(res.data);
        if (error !== undefined) {
            console.log("Error: ", error?.message);
            // connection.removeEventListener("message", () => ticksHistoryResponse(res), false);
            // await api.disconnect();
        }
        if (msg_type === "candles") {
            if (candles !== undefined) dispatch(updateHistoryPrice({ candles, symbol: echo_req.ticks_history }));
        }
        // connection.removeEventListener("message", () => ticksHistoryResponse(res), false);
    };

    const getActiveSymbols = async () => {
        const active_symbols_request = {
            active_symbols: "brief",
            product_type: "basic",
        };
        connection.addEventListener("message", websocketResponse);
        await api.activeSymbols(active_symbols_request);
    };

    const subscribeTicks = async () => {
        const tickStream = () =>
            api.subscribe({ ticks: filteredData.map((market) => market.symbol) });
        await tickStream();
        connection.addEventListener("message", tickResponse);
    };

    const getTicksHistoryForSymbols = async () => {
        const symbols = filteredData.map((market) => market.symbol);
        for (const symbol of symbols) {
            const request = {
                ...ticks_history_request,
                ticks_history: symbol
            };
            connection.addEventListener("message", ticksHistoryResponse);
            await api.ticksHistory(request);
        }
    };


    const getNameByIndex = (index) => {
        if (index >= 0 && index < marketData.length) {
            setActiveIndex(index);
            dispatch(
                filterMarketIndices({
                    market: marketData[index].market,
                    submarket: marketData[index].subMarket[0].submarket,
                })
            );
        }
        return null;
    };

    // Effects
    // -----------------------------------------------------------------------------------------------
    useEffect(() => {
        getActiveSymbols();
        // return () => {
        //     connection.removeEventListener("message", websocketResponse, false);
        //     connection.removeEventListener("message", tickResponse, false);
        //     connection.removeEventListener("message", ticksHistoryResponse, false);
        // };
    }, []);

    useEffect(() => {
        subscribeTicks();
        getTicksHistoryForSymbols();
    }, [selectedSubMarket]);

    // Render
    // -----------------------------------------------------------------------------------------------

    return (
        <div className="bg-transparent p-5 w-full">
            {marketData.length > 0 && (
                <TabView activeIndex={activeIndex} onTabChange={(e) => getNameByIndex(e.index)}>
                    {marketData.map((market) => (
                        <TabPanel header={market.market_display_name} key={market.market}>
                            {market.subMarket.map((submarket) => (
                                <Button
                                    className="mx-1 my-1"
                                    key={submarket.submarket}
                                    outlined={selectedSubMarket === submarket.submarket}
                                    onClick={() =>
                                        dispatch(
                                            filterMarketIndices({
                                                market: market.market,
                                                submarket: submarket.submarket,
                                            })
                                        )
                                    }
                                    label={submarket.submarket_display_name}
                                />
                            ))}
                        </TabPanel>
                    ))}
                </TabView>
            )}
            <div className="flex flex-col">
                <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                        <div className="overflow-hidden">
                            <table className="min-w-full text-sm">
                                <thead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id} className="bg-[#FF444F] text-white">
                                            {headerGroup.headers.map((header) => {
                                                return (
                                                    <th key={header.id} colSpan={header.colSpan} className="py-2 px-4">
                                                        {header.isPlaceholder ? null : (
                                                            <div
                                                                className={
                                                                    header.column.getCanSort()
                                                                        ? 'cursor-pointer select-none'
                                                                        : ''
                                                                }
                                                                onClick={header.column.getToggleSortingHandler()}
                                                            >
                                                                {flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                                {{
                                                                    asc: ' 🔼',
                                                                    desc: ' 🔽',
                                                                }[header.column.getIsSorted()] || null}
                                                            </div>
                                                        )}
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody>
                                    {table.getRowModel().rows.map((row, index) => (
                                        <tr
                                            key={row.id}
                                            className={index % 2 === 0 ? "bg-white" : "bg-gray-200"}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="text-center py-2 px-4">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Table;
