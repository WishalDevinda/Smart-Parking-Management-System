const SlotUsage = require('../model/SlotUsage');
const MaintenanceLog = require('../model/MaintenanceLog');

function range(req){
  const to = req.query.to ? new Date(req.query.to) : new Date();
  const from = req.query.from ? new Date(req.query.from) : new Date(to.getTime() - 30*24*60*60*1000);
  return { from, to };
}

exports.usage = async (req, res) => {
  try {
    const { from, to } = range(req);
    const data = await SlotUsage.aggregate([
      { $match: { $expr: { $and: [
        { $lte: ['$checkIn', to] },
        { $or: [ { $eq: ['$checkOut', null] }, { $gte: ['$checkOut', from] } ] }
      ]}}},
      { $project: {
        slot: 1,
        start: { $cond: [{ $lt: ['$checkIn', from] }, from, '$checkIn'] },
        end:   { $cond: [{ $or: [{ $eq: ['$checkOut', null] }, { $gt: ['$checkOut', to] }] }, to, '$checkOut'] }
      }},
      { $project: { slot: 1, minutes: { $max: [0, { $divide: [{ $subtract: ['$end', '$start'] }, 60000] }] }, sessions: { $literal: 1 } } },
      { $group: { _id: '$slot', minutes: { $sum: '$minutes' }, sessions: { $sum: '$sessions' } } },
      { $lookup: { from: 'parkingslots', localField: '_id', foreignField: '_id', as: 'slot' } },
      { $unwind: '$slot' },
      { $project: { _id: 0, slotId: '$slot.slotId', sessions: 1, minutes: { $round: ['$minutes', 0] } } },
      { $sort: { slotId: 1 } }
    ]);
    res.json({ from, to, data });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.maintenance = async (req, res) => {
  try {
    const { from, to } = range(req);
    const data = await MaintenanceLog.aggregate([
      { $match: { $expr: { $and: [
        { $lte: ['$startAt', to] },
        { $or: [ { $eq: ['$endAt', null] }, { $gte: ['$endAt', from] } ] }
      ]}}},
      { $project: {
        slot: 1,
        start: { $cond: [{ $lt: ['$startAt', from] }, from, '$startAt'] },
        end:   { $cond: [{ $or: [{ $eq: ['$endAt', null] }, { $gt: ['$endAt', to] }] }, to, '$endAt'] }
      }},
      { $project: { slot: 1, minutes: { $max: [0, { $divide: [{ $subtract: ['$end', '$start'] }, 60000] }] } } },
      { $group: { _id: '$slot', downtimeMins: { $sum: '$minutes' } } },
      { $lookup: { from: 'parkingslots', localField: '_id', foreignField: '_id', as: 'slot' } },
      { $unwind: '$slot' },
      { $project: { _id: 0, slotId: '$slot.slotId', downtimeMins: { $round: ['$downtimeMins', 0] } } },
      { $sort: { slotId: 1 } }
    ]);
    res.json({ from, to, data });
  } catch (e) { res.status(500).json({ error: e.message }); }
};
