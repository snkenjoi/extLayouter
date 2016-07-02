import '../scss/index.scss'
import * as d3 from './util/d3';
import nodeEJS from '../html/node.html'; 
import addEJS from '../html/add.html'; 
import { view, addComponent } from './view';
import { icons } from './icons';
import { xtypes } from './extdata';

let treeView = d3.select('#treeView');

function draw(obj, data) {

    let branch = obj.selectAll('.item').data(data)

    branch.exit().remove();

    branch
        .enter()
        .append('div')
        .attr('class', d => `item${' xtype-'+d.xtype||''}`)
        .each(function(d) {d.extLayout.node = this})
        .merge(branch)
        .call(drawMenu)
        .each(function (d) {
            d.items &&
            d3.select(this)
                .call(draw, d => d.items)
        })
        .call(collapse)
        .order()
}

function drawMenu(selection) {

    if (selection.select('.menu').empty()) {
        let menu = selection
            .append('div')
            .classed('menu',1)
            .call(setMenu)
    }
    else {
        selection.select('.menu')
            .call(setMenu);
    }
        
    function setMenu(selection) {
        selection
            .html(node => nodeEJS({ node, icons, layout: node.extLayout }))
            .call(addEvents);
    }
}

function collapse(selection) {
    selection
        .each(function(d) {
            if (d.extLayout.collapsed) {
                d3.select(this)
                    .selectAll('.item')
                    .remove()
            }
        })
}

function addEvents(selection) {
    selection
        .select('.collapse')
        .on('click', function(d) {
            d.extLayout.collapsed = !d.extLayout.collapsed;
            draw(treeView, view);
        })

    selection
        .select('.delete')
        .on('click', function(d,i) {
            d.extLayout.parent.splice(i,1);
            draw(treeView, view);
        })

    selection
        .select('.moveUp')
        .on('click', function(d,i) {
            if (i != 0) {
                [d.extLayout.parent[i-1],d.extLayout.parent[i]] = [d.extLayout.parent[i],d.extLayout.parent[i-1]];
                draw(treeView, view);
            }
        })

    selection
        .select('.moveDown')
        .on('click', function(d,i) {
            if (i != d.extLayout.parent.length-1) {
                [d.extLayout.parent[i+1],d.extLayout.parent[i]] = [d.extLayout.parent[i],d.extLayout.parent[i+1]];
                draw(treeView, view);
            }
        })

    selection
        .select('.add')
        .on('click', function(d) {

            treeView
                .selectAll('.addComponent')
                .remove()

            let add = treeView
                .append('div')
                .attr('class', 'addComponent')
                .style('left', d3.event.clientX - 25 + 'px')
                .style('top', d3.event.clientY + 10 + 'px')
                .html(addEJS({ xtypes, icons }))

            add.select('.cancel')
                .on('click', function() {
                    add.remove();
                })

            let xtype = add.select('.xtype');

            let xtypeLookup = add.select('.xtypeLookup')
                .on('change', function() {
                    let value = xtypeLookup.property('value');
                    xtype.property('value', value)
                    xtypeLookup.node().selectedIndex = 0;
                })

            add.select('.ok')
                .on('click', function() {
                    addComponent(d, xtype.property('value'))
                    add.remove();
                    draw(treeView, view);
                })
        })

    // icons

    // edit itemId

    // check if container when adding component

    // props popup (?)
    // add copy (clone.svg)
    // don't allow changing xtype
    // post processor for output stripping _extLayouter

    // on end, add
}

// load view

draw(treeView, view);