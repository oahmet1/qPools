import React, {FC} from "react";
import Statistics from "../../src/components/Statistics";

export const HeroLeft: FC = ({}) => {

    return (
        <div className={"2xl:ml-40"}>
            {/*md:pt-0*/}
            <div className={"px-1 pt-10 2xl:pt-44"}>
                <div className={"text-center md:text-left"}>
                    <h1 className="invisible md:visible absolute text-5xl lg:text-7xl font-bold transform -translate-x-1 -translate-y-1">
                        Generate Yields
                        <br/>
                        Stay Liquid
                    </h1>
                    <h1 className="text-5xl lg:text-7xl font-bold text-white md:text-pink-500">
                        Generate Yields
                        <br/>
                        Stay Liquid
                    </h1>
                </div>
            </div>
            <br />
            <div>
                <p className="pb-1 text-2xl text-gray-100 leading-10 text-center md:text-left">
                    <p>
                        The most convenient way to generate passive income
                    </p>
                    <p>
                        without locking in liquidity. Risk-adjusted for your favorite asset.
                    </p>
                </p>
            </div>
            <div className={"md:pt-10"}>
                <Statistics />
            </div>
        </div>
    );

}