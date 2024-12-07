import React from 'react';

const About: React.FC = () => {
    return (
        <div className="container">

            <div className='text-content'>
                <div>
                    <h2>About The Project</h2>
                    <p>This tool was developped to create and search different permutations (tabdīl pl. tabādīl) of a given Arabic name using parts of the kunya and/or laqab, nasab, and nisba(s). I designed it primarily to aid in finding information about lesser-known figures. Currently, you can't search for common/simple names like like ابن تيمية and ابن عساكر. So, if you are interested in finding any mention of, say, Ibn Taymiyya, then you will be better served by using other tools, be it al-Maktaba al-Shamela or my <a href="https://mutun.pages.dev">mutūn app</a>, which is currently in early stages of testing. That being said, I'm, planning on making searches for simple names possible in a future update.</p>
                    <p>Note that nearly all of the metadata transliterations, including author names, text titles, and edition information, was done automatically via large language models (LLMs), and has yet to be cleaned. So if you notice any strange/incorrect transliterations, that is why.</p>
                    <h2>How to Use</h2>
                    <ul>
                        <li>Enter in two of the three: kunya (e.g. أبو منصور), multi-part nasab (e.g. معمر بن أحمد بن زياد), and nisba (e.g. الأصبهاني)</li>
                        <ul>
                            <li>For the nasab, you should enter at least 2 names (e.g. أحمد بن محمد). However, if you only know the first name and at least the kunya (e.g. أبو منصور معمر), you can check the "Search Kunya + 1st nasab" box (see examples below). In it's current form the search only uses up to a 3-part nasab. So if you put in a 4-part nasab (e.g. أحمد بن محمد بن عبد الله بن فلان) it will only run permutations on the first three, i.e. أحمد بن محمد بن عبد الله</li>
                            <li>If you don't know the first name of the nasab (e.g. أم القاسم بنت محمد بن عبد الله), you can just put what you know in (e.g.  بنت محمد بن عبد الله)</li>
                            <li>You can also enter additional nisbas and/or a laqab</li>
                        </ul>
                        <li>There are four checkboxes, "2-Part Nasab", "Kunya + Nisba", "Kunya + 1st Nasab," and "1st Nasab + Nisba" that are unchecked by default since they can result in a significant number of results to wade through.</li>
                        <ul>
                            <li>Checking "kunya + nisba" will include a search for just the kunya and nisba in a search (see example below). </li>
                            <li>Checking "kunya + 1st nasab" will include a search for just the kunya and first name in the nasab in a search (see example below). </li>
                            <li>Checking "2-part nasab" will perform a search just based on the first two names in the nasab, which can produce an extreme amount of results depending on the commonality of the names (see example below).</li>
                            <li>Checking "1st nasab + nisba" will include a search for just the first name in the nasab plus the nisba (see example below). </li>
                        </ul>
                        <li>By default, this searches all 10,000+ texts from the <a href="mutun.pages.dev">mutūn corpus</a>, but you can filter and select a subset of these texts.</li>
                        <li>It will automatically search for: أبو، أبي، and أبا</li>
                        <li>It will automatically control for proclitics such as: و، ف، ك، ل، and ب</li>
                        <li>It normalizes all ḥamzas to increase matches</li>
                    </ul>
                    <p>Here is a list of permutations produced by the example of: أبو منصور معمر بن أحمد بن زياد الأصبهاني</p>
                </div>
                <div className='permuations-list'>
                    <ul className='right'>
                        <li>اب* منصور معمر الاصبهاني</li>
                        <li>اب* منصور معمر بن احمد</li>
                        <li>اب* منصور معمر بن احمد الاصبهاني</li>
                        <li>اب* منصور معمر بن احمد بن زياد</li>
                        <li>اب* منصور معمر بن احمد بن زياد الاصبهاني</li>
                        <li>اب* منصور بن احمد</li>
                        <li>اب* منصور بن احمد الاصبهاني</li>
                        <li>اب* منصور بن احمد بن زياد</li>
                        <li>اب* منصور بن احمد بن زياد الاصبهاني</li>
                        <li>معمر بن احمد بن زياد</li>
                        <li>معمر بن احمد بن زياد الاصبهاني</li>
                        <li>معمر بن احمد الاصبهاني</li>
                        <li className='red'>اب* منصور الاصبهاني (kunya + nisba checkbox)</li>
                        <li className='red'>اب* منصور معمر (kunya + 1st nasab checkbox)</li>
                        <li className='red'>معمر بن احمد (2-part nasab checkbox)</li>
                        <li className='red'>معمر الاصبهاني (1st nasab + nisba checkbox)</li>
                    </ul>
                </div>
                <div>
                    <h2>To-Do/Upcoming Features</h2>
                    <ul>
                        <li>Add functionality for searching smaller/more popular names (e.g. ابن تيمية or ابن عربي or ابن عساكر)</li>
                        <li>Isnād extraction</li>
                    </ul>
                    <h2>Acknowledgements</h2>
                    <p>This web app links to another project I developed, mutūn (<a href="https://mutun.pages.dev">mutun.pages.dev</a>), which was inititally funded by a Faculty Digital Humanities Seed Grant at NYU.</p>
                    <h2>About Me</h2>
                    <p>My name is Antonio Musto, and I'm a Postdoctoral Visiting Lecturer at NYU, where I received my Ph.D. in 2024 from the Middle Eastern and Islamic Studies department. You can learn more about my work at <a href='https://www.antoniomusto.com'>my website</a>, my <a href="https://nyu.academia.edu/AntonioMusto">academia.edu</a> profile, and my <a href="https://github.com/ammusto">github</a>. You can also follow me on twitter <a href="https://x.com/deepcutiqtibas">@deepcutiqtibas</a>.</p>
                </div>
            </div>
        </div>
    );
};
export default About;